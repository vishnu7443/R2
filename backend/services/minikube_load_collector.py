import os
import sys
import time
import random
import csv
import argparse
import datetime

# Add root workspace directory to sys.path to enable imports of package modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.database import SessionLocal
from backend.models import InfrastructureMetric

# Telemetry limits/baselines configuration
BASELINES = {
    "payment-service": {"cpu": 45.0, "memory": 55.0, "network": 1200.0, "latency": 45.0},
    "auth-service": {"cpu": 30.0, "memory": 40.0, "network": 600.0, "latency": 15.0},
    "frontend-service": {"cpu": 25.0, "memory": 35.0, "network": 2400.0, "latency": 70.0},
    "database-service": {"cpu": 50.0, "memory": 70.0, "network": 800.0, "latency": 10.0}
}

def check_dependencies():
    """Checks if external kubernetes and requests dependencies are loaded."""
    try:
        # pyrefly: ignore [missing-import]
        import kubernetes
        import requests
        return True, "Success"
    except ImportError as e:
        return False, str(e)

def run_load_generator(threads_count=5):
    """Simulates localized load test. Runs basic calculations to simulate CPU stress."""
    print(f"[*] Starting localized load generation threads ({threads_count})...")
    # Non-blocking CPU stress calculation
    total = 0
    for _ in range(100000 * threads_count):
        total += random.random() * random.random()

def collect_from_prometheus(prom_url, service):
    """Fetches real CPU metrics for a service container from Prometheus API."""
    import requests
    query = f'sum(rate(container_cpu_usage_seconds_total{{container="{service}"}}[1m])) * 100'
    try:
        res = requests.get(f"{prom_url}/api/v1/query", params={"query": query}, timeout=3)
        if res.status_code == 200:
            data = res.json().get("data", {}).get("result", [])
            if data:
                val = data[0].get("value", [])
                if len(val) == 2:
                    return float(val[1])
    except Exception as e:
        print(f"[!] Prometheus connection failed for {service}: {e}")
    return None

def collect_replica_count(service):
    """Fetches real pod replica count from Kubernetes API client."""
    try:
        # pyrefly: ignore [missing-import]
        from kubernetes import client, config
        config.load_kube_config()
        v1 = client.AppsV1Api()
        dep = v1.read_namespaced_deployment(name=service, namespace="default")
        return dep.status.replicas or 1
    except Exception as e:
        # Fallback to local default replicas if kubeconfig is not loaded
        return 3 if service in ["payment-service", "frontend-service"] else (2 if service == "auth-service" else 1)

def record_telemetry(duration_seconds, prom_url, generate_stress):
    """Records telemetry from Kubernetes/Prometheus or falls back to high-fidelity logs."""
    has_deps, dep_error = check_dependencies()
    print(f"[*] Pluggable Adapter Status: Has Live SDK Dependencies: {has_deps}")
    if not has_deps:
        print(f"[!] Warning: Missing import dependency ({dep_error}). Falling back to high-fidelity simulation.")

    csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "training_data.csv")
    csv_exists = os.path.exists(csv_path)

    # Initialize CSV writer
    csv_file = open(csv_path, mode="a", newline="", encoding="utf-8")
    csv_writer = csv.writer(csv_file)
    if not csv_exists:
        csv_writer.writerow(["timestamp", "service_name", "cpu_utilization", "memory_utilization", "network_throughput", "latency_ms", "pod_count", "node_count"])

    db = SessionLocal()
    
    # Simulate a realistic incident flow if we are generating metrics synthetically:
    # 0s - 15s: Nominal baseline metrics
    # 15s - 45s: Outage CPU spike anomaly starts
    # 45s+: AutoPilot mitigation (scaling up replicas) decreases CPU load back to normal
    start_time = time.time()
    step = 0

    print(f"[*] Starting telemetry record collection loop for {duration_seconds}s (writing to {csv_path})...")
    
    try:
        while time.time() - start_time < duration_seconds:
            timestamp = datetime.datetime.utcnow()
            
            if generate_stress:
                run_load_generator()

            for service, base in BASELINES.items():
                real_cpu = None
                real_replicas = 3

                if has_deps:
                    # Query live APIs
                    real_cpu = collect_from_prometheus(prom_url, service)
                    real_replicas = collect_replica_count(service)

                # Fallback calculation logic with high-fidelity incidents pattern
                if real_cpu is None:
                    # Generate synthetic load profiles with an anomaly flow
                    cpu = base["cpu"] + random.uniform(-1.5, 1.5)
                    memory = base["memory"] + random.uniform(-1.0, 1.0)
                    network = base["network"] + random.uniform(-20.0, 20.0)
                    latency = base["latency"] + random.uniform(-1.5, 1.5)
                    replicas = real_replicas

                    # Inject CPU Spike anomaly between steps 5 and 15
                    if service == "payment-service" and 5 <= step <= 15:
                        cpu = min(98.0, cpu + (90.0 - cpu) * ((step - 5) / 10))
                        latency = latency * (1.0 + (step - 5) * 0.3)
                        print(f"[!] Generating simulated anomaly spike on {service}: CPU: {cpu:.1f}%, Latency: {latency:.1f}ms")
                    
                    # Simulate AutoPilot scaling response at step 16 (increasing replicas to 5, lowering load)
                    if service == "payment-service" and step > 15:
                        replicas = 5
                        ratio = 3 / 5
                        cpu = cpu * ratio
                        latency = latency * ratio
                else:
                    cpu = real_cpu
                    memory = base["memory"] + random.uniform(-1.0, 1.0) # Real CPU + baseline mem
                    network = base["network"] + random.uniform(-20.0, 20.0)
                    latency = base["latency"] + random.uniform(-1.5, 1.5)
                    replicas = real_replicas

                # 1. Save telemetry to CSV file (Training Data)
                csv_writer.writerow([
                    timestamp.isoformat(),
                    service,
                    round(cpu, 2),
                    round(memory, 2),
                    round(network, 2),
                    round(latency, 2),
                    replicas,
                    5
                ])
                csv_file.flush()

                # 2. Seed directly into vector database to drive the real workflow
                metric_entry = InfrastructureMetric(
                    timestamp=timestamp,
                    service_name=service,
                    cpu_utilization=round(cpu, 2),
                    memory_utilization=round(memory, 2),
                    network_throughput=round(network, 2),
                    latency_ms=round(latency, 2),
                    pod_count=replicas,
                    node_count=5
                )
                db.add(metric_entry)

            db.commit()
            step += 1
            time.sleep(3) # Collect samples every 3 seconds

        print(f"[+] Recording finished successfully. Training dataset updated: {csv_path}")

    except KeyboardInterrupt:
        print("[*] Recording cancelled by operator.")
    finally:
        csv_file.close()
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Minikube metrics load collector and training database seeder.")
    parser.add_argument("--duration", type=int, default=60, help="Duration of collection in seconds.")
    parser.add_argument("--prometheus", type=str, default="http://localhost:9090", help="Prometheus URL.")
    parser.add_argument("--load", action="store_true", help="Generate localized CPU load.")
    args = parser.parse_args()

    record_telemetry(args.duration, args.prometheus, args.load)
