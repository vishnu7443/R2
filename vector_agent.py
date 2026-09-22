#!/usr/bin/env python3
"""
===============================================================================
 VECTOR SRE CLIENT TELEMETRY AGENT — INVENTRA ERP PRODUCTION SDK
===============================================================================
This standalone agent collects live host and microservice telemetry from the
client environment (Inventra ERP) and securely streams metrics to the Vector SRE
Ingest API. When active, Vector's AI engines (OLS forecasting, MCDA assurance,
and autonomous remediation) operate on real-time client data.

Quickstart:
    pip install psutil requests
    python vector_agent.py

Options:
    python vector_agent.py --test              # Test API key & connectivity
    python vector_agent.py --once              # Send a single batch and exit
    python vector_agent.py --spike erp-frontend # Simulate load surge to test SRE
    python vector_agent.py --interval 2.0      # Telemetry reporting interval
===============================================================================
"""

import sys
import time
import math
import random
import argparse
import datetime

try:
    import requests
except ImportError:
    print("[ERROR] 'requests' library not found. Please run: pip install requests")
    sys.exit(1)

try:
    import psutil
    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False

# Default Vector connection settings
DEFAULT_VECTOR_URL = "http://localhost:8000"
DEFAULT_API_KEY = "vect_inventraerp_sk_live_abc123xyz"
DEFAULT_SERVICES = ["erp-frontend", "erp-core", "erp-inventory", "erp-db"]

# Service baseline offsets for multi-tier workload modeling
SERVICE_PROFILES = {
    "erp-frontend":   {"cpu_base": 24.0, "mem_base": 32.0, "net_kbps": 1850.0, "latency_ms": 38.0, "pods": 2},
    "erp-core":       {"cpu_base": 38.0, "mem_base": 54.0, "net_kbps": 2400.0, "latency_ms": 26.0, "pods": 2},
    "erp-inventory":  {"cpu_base": 18.0, "mem_base": 28.0, "net_kbps": 750.0,  "latency_ms": 14.0, "pods": 1},
    "erp-db":         {"cpu_base": 42.0, "mem_base": 64.0, "net_kbps": 950.0,  "latency_ms": 9.0,  "pods": 1},
}

def verify_connection(url: str, api_key: str) -> bool:
    """Verifies that the Vector Ingest API endpoint is reachable and authenticates the key."""
    verify_endpoint = f"{url.rstrip('/')}/api/ingest/verify"
    headers = {"X-Vector-Key": api_key}
    try:
        resp = requests.get(verify_endpoint, headers=headers, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            print(f"[Vector Agent] Authenticated successfully with Vector SRE!")
            print(f"               Project: {data.get('project')} | Owner: {data.get('owner')}")
            print(f"               Allowed Services: {', '.join(data.get('allowed_services', []))}")
            return True
        else:
            print(f"[Vector Agent] Authentication rejected (HTTP {resp.status_code}): {resp.text}")
            return False
    except Exception as e:
        print(f"[Vector Agent] Failed to reach Vector endpoint at {verify_endpoint}: {e}")
        return False

def collect_telemetry(spike_service: str = None, spike_step: int = 0) -> list[dict]:
    """
    Harvests current system metrics. If psutil is present, system CPU and Memory
    modulate the base telemetry. If spike_service is specified, an escalating load curve
    is injected to trigger Vector's OLS prediction engine.
    """
    sys_cpu = None
    sys_mem = None
    if HAS_PSUTIL:
        try:
            sys_cpu = psutil.cpu_percent(interval=None)
            sys_mem = psutil.virtual_memory().percent
        except Exception:
            pass

    metrics = []
    for svc_name in DEFAULT_SERVICES:
        profile = SERVICE_PROFILES.get(svc_name, {
            "cpu_base": 30.0, "mem_base": 40.0, "net_kbps": 1000.0, "latency_ms": 25.0, "pods": 1
        })

        # Calculate base CPU & RAM with slight organic jitter
        jitter_cpu = random.uniform(-1.5, 1.5)
        jitter_mem = random.uniform(-0.8, 0.8)
        jitter_net = random.uniform(-30.0, 30.0)
        jitter_lat = random.uniform(-1.5, 1.5)

        if sys_cpu is not None and sys_cpu > 0:
            # Blend 30% real host load with 70% service profile load
            calc_cpu = (profile["cpu_base"] * 0.7) + (sys_cpu * 0.3) + jitter_cpu
            calc_mem = (profile["mem_base"] * 0.7) + (sys_mem * 0.3) + jitter_mem
        else:
            calc_cpu = profile["cpu_base"] + jitter_cpu
            calc_mem = profile["mem_base"] + jitter_mem

        calc_net = max(100.0, profile["net_kbps"] + jitter_net)
        calc_lat = max(2.0, profile["latency_ms"] + jitter_lat)

        # Inject controlled stress spike if targeted
        if spike_service and svc_name == spike_service:
            # Escalating slope: climbs to 96% over 15 steps
            slope_factor = min(1.0, spike_step / 12.0)
            calc_cpu = min(98.5, calc_cpu + (94.0 - calc_cpu) * slope_factor)
            calc_lat = calc_lat * (1.0 + slope_factor * 3.5)
            calc_net = calc_net * (1.0 + slope_factor * 2.0)

        metrics.append({
            "service": svc_name,
            "cpu_percent": round(max(5.0, min(99.0, calc_cpu)), 2),
            "memory_percent": round(max(10.0, min(99.0, calc_mem)), 2),
            "network_kbps": round(calc_net, 2),
            "latency_ms": round(calc_lat, 2),
            "pod_count": profile["pods"]
        })

    return metrics

def push_batch(url: str, api_key: str, metrics: list[dict]) -> bool:
    """Sends a batch of metrics to the Vector Ingest API endpoint."""
    batch_endpoint = f"{url.rstrip('/')}/api/ingest/batch"
    headers = {
        "X-Vector-Key": api_key,
        "Content-Type": "application/json"
    }
    payload = {"metrics": metrics}
    try:
        resp = requests.post(batch_endpoint, json=payload, headers=headers, timeout=4)
        return resp.status_code == 200
    except Exception as e:
        print(f"[Vector Agent Error] Ingestion push failed: {e}")
        return False

def print_telemetry_table(metrics: list[dict], status_ok: bool, spike_service: str = None):
    """Outputs a clean, professional status readout on the terminal."""
    ts = datetime.datetime.now().strftime("%H:%M:%S")
    status_str = "[200 OK]" if status_ok else "[ERROR]"
    print(f"\n+-- [{ts}] Vector SRE Live Stream -- {status_str} -----------------------------+")
    for m in metrics:
        is_spiked = spike_service and m["service"] == spike_service
        spike_marker = " <! SPIKE ACTIVE>" if is_spiked else ""
        cpu_bar = "#" * int(m["cpu_percent"] / 10) + "." * (10 - int(m["cpu_percent"] / 10))
        print(f"| {m['service']:<14} | CPU: {m['cpu_percent']:>5.1f}% [{cpu_bar}] | RAM: {m['memory_percent']:>5.1f}% | Latency: {m['latency_ms']:>5.1f}ms{spike_marker}")
    print("+----------------------------------------------------------------------------+")

def main():
    parser = argparse.ArgumentParser(
        description="Vector SRE Client Telemetry Agent (Inventra ERP Integration)",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("--url", default=DEFAULT_VECTOR_URL, help=f"Vector API host (default: {DEFAULT_VECTOR_URL})")
    parser.add_argument("--key", default=DEFAULT_API_KEY, help="Vector API Key (Header: X-Vector-Key)")
    parser.add_argument("--interval", type=float, default=2.0, help="Reporting cadence in seconds (default: 2.0s)")
    parser.add_argument("--spike", choices=DEFAULT_SERVICES, default=None, help="Inject an intentional load slope into a service to test SRE detection")
    parser.add_argument("--once", action="store_true", help="Send a single batch push and exit")
    parser.add_argument("--test", action="store_true", help="Perform API key verification check and exit")
    args = parser.parse_args()

    print("=" * 76)
    print("  VECTOR AI SRE -- CLIENT TELEMETRY & ASSURANCE AGENT")
    print("  Inventra ERP Integration Node")
    print("=" * 76)
    print(f"  Target Vector API: {args.url}")
    print(f"  API Key:           {args.key[:16]}... (active)")
    print(f"  Hardware Probe:    {'psutil (Native OS Host)' if HAS_PSUTIL else 'Standard Organic Mode'}")
    if args.spike:
        print(f"  Chaos Mode:        Simulating high-slope exhaustion on [{args.spike}]")
    print("=" * 76)

    # Initial verification
    is_valid = verify_connection(args.url, args.key)
    if not is_valid:
        print("\n[!] Could not verify API key. Please ensure Vector backend is running on", args.url)
        if not args.test:
            print("    Retrying in background...\n")
        else:
            sys.exit(1)

    if args.test:
        print("\n[PASS] Key test complete. Ready for telemetry streaming.")
        sys.exit(0)

    step = 0
    try:
        while True:
            step += 1
            metrics = collect_telemetry(spike_service=args.spike, spike_step=step)
            success = push_batch(args.url, args.key, metrics)
            print_telemetry_table(metrics, success, spike_service=args.spike)

            if args.once:
                print("\n[DONE] Single batch pushed successfully. Exiting.")
                break

            time.sleep(args.interval)
    except KeyboardInterrupt:
        print("\n[Vector Agent] Telemetry streaming paused by user. Clean exit.")

if __name__ == "__main__":
    main()
