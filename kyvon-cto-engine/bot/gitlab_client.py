"""
GitLab REST API v4 Client for KYVON CTO Bot
Handles MR changes extraction, comment posting, and pipeline triggers.
"""

import os
import logging
from typing import Dict, Any, List, Optional
import httpx

logger = logging.getLogger("KYVON-GITLAB-CLIENT")


class GitLabClient:
    def __init__(self, base_url: Optional[str] = None, private_token: Optional[str] = None):
        self.base_url = (base_url or os.getenv("GITLAB_URL", "https://gitlab.reiwasakura.tech")).rstrip("/")
        self.api_url = f"{self.base_url}/api/v4"
        self.token = private_token or os.getenv("GITLAB_TOKEN", "")
        self.headers = {
            "PRIVATE-TOKEN": self.token,
            "Content-Type": "application/json"
        }

    async def get_mr_details(self, project_id: int, mr_iid: int) -> Dict[str, Any]:
        """Fetches Merge Request metadata."""
        url = f"{self.api_url}/projects/{project_id}/merge_requests/{mr_iid}"
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, headers=self.headers)
            resp.raise_for_status()
            return resp.json()

    async def get_mr_changes(self, project_id: int, mr_iid: int) -> Dict[str, Any]:
        """Fetches full code diff changes for a Merge Request."""
        url = f"{self.api_url}/projects/{project_id}/merge_requests/{mr_iid}/changes"
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(url, headers=self.headers)
            resp.raise_for_status()
            return resp.json()

    async def post_mr_comment(self, project_id: int, mr_iid: int, body: str) -> Dict[str, Any]:
        """Posts a markdown note/comment on a Merge Request."""
        url = f"{self.api_url}/projects/{project_id}/merge_requests/{mr_iid}/notes"
        payload = {"body": body}
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, headers=self.headers, json=payload)
            resp.raise_for_status()
            return resp.json()

    async def post_issue_comment(self, project_id: int, issue_iid: int, body: str) -> Dict[str, Any]:
        """Posts a comment on an Issue."""
        url = f"{self.api_url}/projects/{project_id}/issues/{issue_iid}/notes"
        payload = {"body": body}
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, headers=self.headers, json=payload)
            resp.raise_for_status()
            return resp.json()

    def aggregate_diff_text(self, mr_changes_data: Dict[str, Any]) -> str:
        """Combines all changed files into a formatted diff text block."""
        changes = mr_changes_data.get("changes", [])
        diff_chunks = []
        for change in changes:
            old_path = change.get("old_path", "")
            new_path = change.get("new_path", "")
            diff = change.get("diff", "")
            diff_chunks.append(f"--- a/{old_path}\n+++ b/{new_path}\n{diff}")
        return "\n\n".join(diff_chunks)
