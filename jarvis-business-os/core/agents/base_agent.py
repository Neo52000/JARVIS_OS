"""Base Agent — lightweight, composable, no heavy frameworks."""
import logging
from dataclasses import dataclass, field
from services import mistral_client as llm
from core.memory import chroma_store as memory

log = logging.getLogger("jarvis.agent")


@dataclass
class AgentResult:
    agent: str
    task: str
    output: str
    success: bool = True
    metadata: dict = field(default_factory=dict)


class BaseAgent:
    """Lightweight agent: role + system prompt + tools."""

    name: str = "base"
    role: str = "Generic assistant"
    system_prompt: str = "You are a helpful AI assistant."
    tier: int = 3  # 1=director, 2=lead, 3=specialist

    async def run(self, task: str, context: str = "") -> AgentResult:
        """Execute a task with optional context."""
        log.info(f"[{self.name}] Running: {task[:80]}...")

        # Build messages
        user_content = task
        if context:
            user_content = f"Context:\n{context}\n\n---\nTask:\n{task}"

        # Search memory for relevant info
        memories = memory.search(task, n_results=3)
        if memories:
            mem_text = "\n".join(f"- {m['text']}" for m in memories)
            user_content = f"Relevant memory:\n{mem_text}\n\n---\n{user_content}"

        try:
            result = await llm.chat(
                messages=[{"role": "user", "content": user_content}],
                system=self.system_prompt,
            )
            # Store result in memory
            memory.store(
                f"[{self.name}] Task: {task[:100]} → Result: {result[:200]}",
                metadata={"agent": self.name, "task_type": "execution"},
            )
            return AgentResult(agent=self.name, task=task, output=result)
        except Exception as e:
            log.error(f"[{self.name}] Failed: {e}")
            return AgentResult(agent=self.name, task=task, output=str(e), success=False)

    async def generate_structured(self, prompt: str) -> dict | list:
        """Generate structured JSON output."""
        return await llm.generate_json(prompt, system=self.system_prompt)
