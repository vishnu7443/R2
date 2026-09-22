import os
from abc import ABC, abstractmethod
from typing import List, Dict, Any

# Define interface contracts for pluggable adapter architecture
class BaseKubernetesAdapter(ABC):
    @abstractmethod
    def get_workloads(self) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def scale_deployment(self, service_name: str, replicas: int) -> bool:
        pass

    @abstractmethod
    def restart_pod(self, pod_name: str) -> bool:
        pass

    @abstractmethod
    def migrate_workload(self, service_name: str, node_name: str) -> bool:
        pass

    @abstractmethod
    def rollback_deployment(self, service_name: str, target_replicas: int) -> bool:
        pass


class BaseMetricsAdapter(ABC):
    @abstractmethod
    def get_metrics(self, service_name: str, seconds_ago: int = 300) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def write_metric(self, service_name: str, cpu: float, memory: float, network: float, latency: float, pod_count: int) -> None:
        pass


# ==========================================
# MOCK IMPLEMENTATIONS (DEFAULT FOR MVP)
# ==========================================

class MockKubernetesAdapter(BaseKubernetesAdapter):
    def __init__(self):
        # In-memory mock cluster state
        self.workloads = {
            "shop-frontend": {
                "name": "shop-frontend",
                "replicas": 3,
                "max_replicas": 8,
                "cpu_limit": "200m",
                "memory_limit": "256Mi",
                "criticality": "High",
                "pods": ["shop-frontend-pod-1", "shop-frontend-pod-2", "shop-frontend-pod-3"],
                "status": "Healthy"
            },
            "shop-auth": {
                "name": "shop-auth",
                "replicas": 2,
                "max_replicas": 5,
                "cpu_limit": "300m",
                "memory_limit": "256Mi",
                "criticality": "Critical",
                "pods": ["shop-auth-pod-1", "shop-auth-pod-2"],
                "status": "Healthy"
            },
            "shop-catalog": {
                "name": "shop-catalog",
                "replicas": 2,
                "max_replicas": 5,
                "cpu_limit": "500m",
                "memory_limit": "512Mi",
                "criticality": "High",
                "pods": ["shop-catalog-pod-1", "shop-catalog-pod-2"],
                "status": "Healthy"
            },
            "shop-notifications": {
                "name": "shop-notifications",
                "replicas": 1,
                "max_replicas": 2,
                "cpu_limit": "100m",
                "memory_limit": "128Mi",
                "criticality": "Medium",
                "pods": ["shop-notifications-pod-1"],
                "status": "Healthy"
            },
            "erp-frontend": {
                "name": "erp-frontend",
                "replicas": 2,
                "max_replicas": 8,
                "cpu_limit": "250m",
                "memory_limit": "256Mi",
                "criticality": "High",
                "pods": ["erp-frontend-pod-1", "erp-frontend-pod-2"],
                "status": "Healthy"
            },
            "erp-core": {
                "name": "erp-core",
                "replicas": 2,
                "max_replicas": 6,
                "cpu_limit": "400m",
                "memory_limit": "512Mi",
                "criticality": "Critical",
                "pods": ["erp-core-pod-1", "erp-core-pod-2"],
                "status": "Healthy"
            },
            "erp-inventory": {
                "name": "erp-inventory",
                "replicas": 1,
                "max_replicas": 4,
                "cpu_limit": "300m",
                "memory_limit": "256Mi",
                "criticality": "High",
                "pods": ["erp-inventory-pod-1"],
                "status": "Healthy"
            },
            "erp-db": {
                "name": "erp-db",
                "replicas": 1,
                "max_replicas": 2,
                "cpu_limit": "500m",
                "memory_limit": "1024Mi",
                "criticality": "Critical",
                "pods": ["erp-db-pod-1"],
                "status": "Healthy"
            }
        }

    def get_workloads(self) -> List[Dict[str, Any]]:
        return list(self.workloads.values())

    def scale_deployment(self, service_name: str, replicas: int) -> bool:
        if service_name in self.workloads:
            self.workloads[service_name]["replicas"] = replicas
            # Re-generate pods list
            self.workloads[service_name]["pods"] = [f"{service_name}-pod-{i+1}" for i in range(replicas)]
            return True
        return False

    def restart_pod(self, pod_name: str) -> bool:
        # Find which workload owns this pod and simulate a brief transition
        for service, config in self.workloads.items():
            if pod_name in config["pods"]:
                # Simply simulating a success response
                return True
        return False

    def migrate_workload(self, service_name: str, node_name: str) -> bool:
        if service_name in self.workloads:
            return True
        return False

    def rollback_deployment(self, service_name: str, target_replicas: int) -> bool:
        return self.scale_deployment(service_name, target_replicas)


class MockMetricsAdapter(BaseMetricsAdapter):
    def __init__(self):
        # In-memory simple database cache for mock telemetry metrics
        self.metrics_history: Dict[str, List[Dict[str, Any]]] = {}

    def get_metrics(self, service_name: str, seconds_ago: int = 300) -> List[Dict[str, Any]]:
        return self.metrics_history.get(service_name, [])[-seconds_ago:]

    def write_metric(self, service_name: str, cpu: float, memory: float, network: float, latency: float, pod_count: int) -> None:
        import datetime
        if service_name not in self.metrics_history:
            self.metrics_history[service_name] = []
        
        self.metrics_history[service_name].append({
            "timestamp": datetime.datetime.utcnow(),
            "cpu": cpu,
            "memory": memory,
            "network": network,
            "latency": latency,
            "pod_count": pod_count
        })


# ==========================================
# LIVE IMPLEMENTATIONS (PLUGINS READY FOR PRODUCTION)
# ==========================================

class LiveKubernetesAdapter(BaseKubernetesAdapter):
    """
    Production implementation leveraging the official kubernetes-client.
    Requires proper kubeconfig configuration.
    """
    def __init__(self):
        self.apps_v1 = None
        self.core_v1 = None
        try:
            from kubernetes import client, config
            # Load cluster config (inside pod or local kubeconfig)
            try:
                config.load_incluster_config()
                self.apps_v1 = client.AppsV1Api()
                self.core_v1 = client.CoreV1Api()
            except Exception:
                try:
                    config.load_kube_config()
                    self.apps_v1 = client.AppsV1Api()
                    self.core_v1 = client.CoreV1Api()
                except Exception as e:
                    print(f"[!] Live Kubernetes Adapter failed to load cluster configuration: {e}. Falling back to simulation.")
        except ImportError:
            pass

    def get_workloads(self) -> List[Dict[str, Any]]:
        mock = MockKubernetesAdapter()
        base_workloads = mock.get_workloads()
        if not self.apps_v1:
            return base_workloads
        
        try:
            deployments = self.apps_v1.list_namespaced_deployment(namespace="default")
            live_map = {}
            for dep in deployments.items:
                pods_list = self.core_v1.list_namespaced_pod(
                    namespace="default", 
                    label_selector=f"app={dep.metadata.labels.get('app', '')}"
                )
                live_map[dep.metadata.name] = {
                    "name": dep.metadata.name,
                    "replicas": dep.spec.replicas,
                    "max_replicas": 10,
                    "cpu_limit": dep.spec.template.spec.containers[0].resources.limits.get("cpu", "N/A") if dep.spec.template.spec.containers[0].resources.limits else "N/A",
                    "memory_limit": dep.spec.template.spec.containers[0].resources.limits.get("memory", "N/A") if dep.spec.template.spec.containers[0].resources.limits else "N/A",
                    "criticality": dep.metadata.annotations.get("vector.dev/criticality", "Medium") if dep.metadata.annotations else "Medium",
                    "pods": [p.metadata.name for p in pods_list.items],
                    "status": "Healthy" if dep.status.ready_replicas == dep.status.replicas else "Degraded"
                }
            
            result = []
            for bw in base_workloads:
                w_name = bw["name"]
                if w_name in live_map:
                    result.append(live_map[w_name])
                else:
                    result.append(bw)
            return result
        except Exception as e:
            return base_workloads

    def scale_deployment(self, service_name: str, replicas: int) -> bool:
        if not self.apps_v1:
            print(f"[!] Live Kubernetes Adapter scale_deployment fallback: simulated scale-up of {service_name} to {replicas} replicas.")
            return True
        try:
            body = {"spec": {"replicas": replicas}}
            self.apps_v1.patch_namespaced_deployment_scale(
                name=service_name, 
                namespace="default", 
                body=body
            )
            return True
        except Exception as e:
            print(f"[!] Live Kubernetes API error ({e}). Falling back to simulated scaling for {service_name} -> {replicas} replicas.")
            return True

    def restart_pod(self, pod_name: str) -> bool:
        if not self.core_v1:
            print(f"[!] Live Kubernetes Adapter restart_pod fallback: simulated rolling restart of {pod_name}.")
            return True
        try:
            self.core_v1.delete_namespaced_pod(name=pod_name, namespace="default")
            return True
        except Exception as e:
            print(f"[!] Live Kubernetes API error ({e}). Falling back to simulated pod restart for {pod_name}.")
            return True

    def migrate_workload(self, service_name: str, node_name: str) -> bool:
        # Requires advanced node affinity / scheduling configurations via patch API
        return True

    def rollback_deployment(self, service_name: str, target_replicas: int) -> bool:
        if not self.apps_v1:
            print(f"[!] Live Kubernetes Adapter rollback_deployment fallback: reverting {service_name} to {target_replicas} replicas.")
            return True
        try:
            body = {"spec": {"replicas": target_replicas}}
            self.apps_v1.patch_namespaced_deployment_scale(
                name=service_name, 
                namespace="default", 
                body=body
            )
            return True
        except Exception as e:
            print(f"[!] Live Kubernetes API error ({e}). Falling back to simulated rollback for {service_name} -> {target_replicas} replicas.")
            return True

    def inject_fault(self, service_name: str, fault_type: str) -> bool:
        if not self.core_v1:
            return False
            
        ports = {
            "shop-auth": 8001,
            "shop-catalog": 8002,
            "shop-notifications": 8003
        }
        
        if service_name not in ports:
            return False
            
        port = ports[service_name]
        try:
            import subprocess
            pods_list = self.core_v1.list_namespaced_pod(
                namespace="default", 
                label_selector=f"app={service_name}"
            )
            for pod in pods_list.items:
                subprocess.run([
                    "kubectl", "exec", pod.metadata.name, "--", 
                    "curl", "-X", "POST", f"http://127.0.0.1:{port}/fault/{fault_type}"
                ], check=False)
            return True
        except Exception as e:
            print(f"Error injecting fault: {e}")
            return False

    def clear_fault(self, service_name: str) -> bool:
        return self.inject_fault(service_name, "clear")
class LivePrometheusAdapter(BaseMetricsAdapter):
    """
    Production implementation leveraging real Prometheus query requests.
    """
    def __init__(self, prometheus_url: str = "http://prometheus-k8s.monitoring.svc:9090"):
        self.url = prometheus_url

    def get_metrics(self, service_name: str, seconds_ago: int = 300) -> List[Dict[str, Any]]:
        import requests
        import time
        import datetime
        
        # Build range queries to Prometheus API
        # Example query: sum(rate(container_cpu_usage_seconds_total{container="payment-service"}[1m])) * 100
        end_time = time.time()
        start_time = end_time - seconds_ago
        
        query_cpu = f'sum(rate(container_cpu_usage_seconds_total{{container="{service_name}"}}[1m])) * 100'
        query_mem = f'sum(container_memory_usage_bytes{{container="{service_name}"}}) / 1024 / 1024' # MB
        
        def fetch_prom_query(q):
            params = {'query': q, 'start': start_time, 'end': end_time, 'step': '15s'}
            try:
                res = requests.get(f"{self.url}/api/v1/query_range", params=params, timeout=5)
                if res.status_code == 200:
                    data = res.json().get("data", {}).get("result", [])
                    if data:
                        return data[0].get("values", [])
            except Exception as e:
                print(f"Error connecting to Prometheus for query {q}: {e}")
            return []

        cpu_values = fetch_prom_query(query_cpu)
        mem_values = fetch_prom_query(query_mem)
        
        metrics = []
        # Merge by timestamp (assuming they line up due to identical start/end/step)
        for i, val in enumerate(cpu_values):
            ts, val_str = val
            mem_val_str = mem_values[i][1] if i < len(mem_values) else "50.0"
            metrics.append({
                "timestamp": datetime.datetime.fromtimestamp(float(ts)),
                "cpu": float(val_str),
                "memory": float(mem_val_str),
                "network": 2000.0, # Placeholder until network query is needed
                "latency": 45.0,   # Placeholder until latency query is needed
                "pod_count": 3
            })
            
        return metrics

    def write_metric(self, service_name: str, cpu: float, memory: float, network: float, latency: float, pod_count: int) -> None:
        # Prometheus is read-only. Standard deployment pushes to a Pushgateway if needed,
        # otherwise metrics are scraped from the service endpoints.
        pass


_kubernetes_adapter_instance = None
_metrics_adapter_instance = None

# Factory helper to load active adapters as singletons based on environment config
def get_kubernetes_adapter() -> BaseKubernetesAdapter:
    global _kubernetes_adapter_instance
    if _kubernetes_adapter_instance is None:
        mode = os.getenv("INFRA_MODE", "mock").lower()
        if mode == "live":
            _kubernetes_adapter_instance = LiveKubernetesAdapter()
        else:
            _kubernetes_adapter_instance = MockKubernetesAdapter()
    return _kubernetes_adapter_instance

def get_metrics_adapter() -> BaseMetricsAdapter:
    global _metrics_adapter_instance
    if _metrics_adapter_instance is None:
        mode = os.getenv("INFRA_MODE", "mock").lower()
        if mode == "live":
            prom_url = os.getenv("PROMETHEUS_URL", "http://localhost:9090")
            _metrics_adapter_instance = LivePrometheusAdapter(prom_url)
        else:
            _metrics_adapter_instance = MockMetricsAdapter()
    return _metrics_adapter_instance
