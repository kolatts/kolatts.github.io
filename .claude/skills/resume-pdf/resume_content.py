# -*- coding: utf-8 -*-
"""Resume content — shared by the coverage check and the PDF generator."""

NAME = "Sunny Kolattukudy"
CONTACT = "kolatts@gmail.com · (216) 543-4471 · Lewis Center, Ohio · kolatts.github.io"

SUMMARY = (
    "Product-focused platform builder with 10+ years delivering high-impact software across fintech, HR tech, and healthcare. "
    "Specializes in modernizing legacy systems, raising engineering culture, and pushing organizations to the AI frontier — "
    "from proof-of-concept to production. Equally at home shaping technical vision and shipping code."
)

JOBS = [
    (
        "Verifiable",
        "Staff Software Engineer · Developer Experience Guild Leader · August 2025 – Present",
        [
            "Reduced PR review cycle time by 30+ minutes per pull request by building an AI-powered code review pipeline "
            "targeting the Claude platform with automatic fallback to Codex — a reusable GitHub Actions workflow that keeps "
            "reviews and CI/CD standards running org-wide through provider service disruptions.",

            "Shipped Source Warden to production, an AI operations pipeline that proactively triages Datadog alerts and "
            "surfaces the fix and the investigation behind it — with proof in the form of embedded screenshots — directly to "
            "the engineers who own it, replacing manual on-call triage.",

            "Architected the Engineering Internal Developer Portal in .NET and Blazor WASM — AI-native, with agent skills, "
            "self-healing workflows, and E2E test history — so engineers and coding agents operate against a fully realistic "
            "environment with a shared source of truth.",
        ],
    ),
    (
        "Arcoro",
        "Principal Software Engineer · July 2021 – August 2025 · Scottsdale, AZ",
        [
            "Pioneered Arcoro Hub — now the company's central product platform — a technical vision to scale 10x using .NET, "
            "Blazor Hybrid WASM, .NET MAUI, and containerization, with a live synchronization bridge to legacy applications.",

            "Tripled feature delivery speed across all product teams by creating a new SPA and API for ExakTime, enabling "
            "development in Angular and .NET while preserving a seamless experience for existing users.",

            "Stabilized then rewrote a bug-ridden event-driven architecture using Azure Event Hubs, Functions, and Storage — "
            "improving performance by 98%, maximizing observability, and stopping customer data loss.",

            "Led transition to in-memory SQLite EF Core integration tests, executing the regression suite 95+% faster than "
            "Selenium end-to-end tests and encouraging TDD across the team.",
        ],
    ),
    (
        "PNC Bank",
        "Principal Software Engineer · August 2016 – July 2021 · Pittsburgh, PA",
        [
            "Modernized institutional asset management offerings by leading rewrites of two legacy systems into .NET "
            "applications handling millions of dollars per hour — improving performance by 86+% and remediating hundreds of "
            "vulnerabilities to pass internal audit.",

            "Increased QA deployment frequency from once per month to once per commit (4+ per day) by building CI/CD pipelines "
            "with Azure DevOps and IBM UrbanCode Deploy.",

            "Coordinated multiple teams over a year to implement Ping Identity across four applications, delivering a more "
            "secure and seamless login experience that passed internal audit.",

            "Mentored a developer with a focus on code quality and simplicity — who now leads a team of 7 on the same "
            "applications.",
        ],
    ),
]

SKILLS = [
    "C# · .NET 10 · .NET Framework · Blazor (Server and WASM) · TypeScript · Angular · Azure AI Foundry",
    "CI/CD: ARM/Bicep · Terraform · Azure DevOps · GitHub Actions · AWS Bedrock · AWS Lambda · AWS ECS · Docker · Azure CLI",
    "MS-SQL · PostgreSQL · Azure Cosmos DB · Azure Synapse · Kusto",
]

BULLET = "–"


def all_text():
    parts = [NAME, CONTACT, SUMMARY, "SUMMARY", "EMPLOYMENT", "SKILLS", BULLET]
    for company, meta, bullets in JOBS:
        parts += [company, meta] + bullets
    parts += SKILLS
    return parts
