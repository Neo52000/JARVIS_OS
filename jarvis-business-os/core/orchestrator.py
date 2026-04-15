"""Orchestrator — Central command. Routes tasks to agents, logs everything."""
import asyncio
import logging
from datetime import datetime
from core.agents import (
    StrategistAgent,
    MarketingAgent,
    DevAgent,
    AutomationAgent,
    DataAgent,
)
from core.agents.base_agent import AgentResult
from core.memory import chroma_store as memory

log = logging.getLogger("jarvis.orchestrator")


class Orchestrator:
    """Routes tasks to the right agent(s). Supports single and multi-agent execution."""

    def __init__(self):
        self.agents = {
            "strategist": StrategistAgent(),
            "marketing": MarketingAgent(),
            "dev": DevAgent(),
            "automation": AutomationAgent(),
            "data": DataAgent(),
        }
        self._execution_log: list[dict] = []

    def _log_execution(self, agent: str, task: str, success: bool, duration: float):
        entry = {
            "agent": agent,
            "task": task[:100],
            "success": success,
            "duration_s": round(duration, 2),
            "timestamp": datetime.now().isoformat(),
        }
        self._execution_log.append(entry)
        log.info(f"Executed: {entry}")

    async def route(self, task: str, agent_name: str | None = None, context: str = "") -> AgentResult:
        """Route a task to a specific agent or auto-detect the best one."""
        if agent_name and agent_name in self.agents:
            agent = self.agents[agent_name]
        else:
            agent = self._detect_agent(task)

        start = asyncio.get_event_loop().time()
        result = await agent.run(task, context=context)
        duration = asyncio.get_event_loop().time() - start
        self._log_execution(agent.name, task, result.success, duration)
        return result

    def _detect_agent(self, task: str):
        """Simple keyword-based routing. Fast and predictable."""
        task_lower = task.lower()

        marketing_keywords = ["post", "instagram", "facebook", "marketing", "campagne",
                              "contenu", "newsletter", "email", "hashtag", "publicit\u00e9",
                              "annonce", "social", "blog", "seo"]
        strategy_keywords = ["strat\u00e9gie", "business", "pricing", "march\u00e9", "roi",
                             "positionnement", "mon\u00e9tis", "concurrence", "analyse march\u00e9",
                             "plan", "strategy", "revenue", "pricing"]
        dev_keywords = ["code", "api", "endpoint", "composant", "script", "bug",
                        "feature", "fonction", "database", "schema", "develop"]
        automation_keywords = ["automat", "fichier", "export", "batch", "schedule",
                               "cron", "pipeline", "script", "csv", "json"]
        data_keywords = ["client", "fiche", "donn\u00e9es", "analyse", "rapport",
                         "segment", "profil", "base de donn\u00e9es", "stats"]

        scores = {
            "marketing": sum(1 for k in marketing_keywords if k in task_lower),
            "strategist": sum(1 for k in strategy_keywords if k in task_lower),
            "dev": sum(1 for k in dev_keywords if k in task_lower),
            "automation": sum(1 for k in automation_keywords if k in task_lower),
            "data": sum(1 for k in data_keywords if k in task_lower),
        }

        best = max(scores, key=scores.get)
        if scores[best] == 0:
            best = "strategist"
        log.info(f"Auto-routed to [{best}] (scores: {scores})")
        return self.agents[best]

    async def multi_agent(self, tasks: dict[str, str], context: str = "") -> dict[str, AgentResult]:
        """Run multiple agents in parallel. tasks = {agent_name: task_description}."""
        async def _run_one(name: str, task: str):
            return name, await self.route(task, agent_name=name, context=context)

        results_list = await asyncio.gather(
            *[_run_one(name, task) for name, task in tasks.items()]
        )
        return dict(results_list)

    def get_log(self, limit: int = 20) -> list[dict]:
        return self._execution_log[-limit:]

    def list_agents(self) -> list[dict]:
        return [
            {"name": a.name, "role": a.role, "tier": a.tier}
            for a in self.agents.values()
        ]


# Singleton
orchestrator = Orchestrator()
