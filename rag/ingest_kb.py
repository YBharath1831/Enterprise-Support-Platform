"""
Ingest kb_dataset.json into Azure AI Search as a vector + hybrid searchable index.
Reused later by the Policy/RAG agent's search client.

Usage:
    pip install azure-search-documents==11.6.0b1 openai python-dotenv --break-system-packages
    Set the env vars below, then: python ingest_kb.py

Required env vars:
    AZURE_SEARCH_ENDPOINT       e.g. https://fdesearchsupport1001.search.windows.net
    AZURE_SEARCH_ADMIN_KEY      admin key from the Search resource (Keys blade in Azure Portal)
    AZURE_OPENAI_ENDPOINT       e.g. https://fde-openai-support-1001-resource.services.ai.azure.com/
    AZURE_OPENAI_API_KEY        API key from fde-openai-support-1001
    AZURE_OPENAI_EMBED_DEPLOY   deployment name for the embedding model, e.g. "text-embedding"
"""

import json
import os

from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import (
    SearchIndex,
    SimpleField,
    SearchableField,
    SearchFieldDataType,
    VectorSearch,
    HnswAlgorithmConfiguration,
    VectorSearchProfile,
    SearchField,
)
from openai import AzureOpenAI

INDEX_NAME = "support-kb-index"
EMBED_DIM = 1536  # text-embedding-ada-002 output size

search_endpoint = os.environ["AZURE_SEARCH_ENDPOINT"]
search_key = os.environ["AZURE_SEARCH_ADMIN_KEY"]
aoai_endpoint = os.environ["AZURE_OPENAI_ENDPOINT"]
aoai_key = os.environ["AZURE_OPENAI_API_KEY"]
embed_deployment = os.environ["AZURE_OPENAI_EMBED_DEPLOY"]

aoai_client = AzureOpenAI(
    azure_endpoint=aoai_endpoint,
    api_key=aoai_key,
    api_version="2024-10-21",
)

index_client = SearchIndexClient(search_endpoint, AzureKeyCredential(search_key))
search_client = SearchClient(search_endpoint, INDEX_NAME, AzureKeyCredential(search_key))


def create_index():
    fields = [
        SimpleField(name="id", type=SearchFieldDataType.String, key=True),
        SimpleField(name="category", type=SearchFieldDataType.String, filterable=True, facetable=True),
        SimpleField(name="request_type", type=SearchFieldDataType.String, filterable=True, facetable=True),
        SearchableField(name="title", type=SearchFieldDataType.String),
        SearchableField(name="symptoms", type=SearchFieldDataType.String),
        SearchableField(name="resolution_steps", type=SearchFieldDataType.String),
        SearchableField(name="policy_notes", type=SearchFieldDataType.String),
        SimpleField(name="confidence_tag", type=SearchFieldDataType.String, filterable=True),
        SearchField(
            name="contentVector",
            type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
            searchable=True,
            vector_search_dimensions=EMBED_DIM,
            vector_search_profile_name="default-profile",
        ),
    ]

    vector_search = VectorSearch(
        algorithms=[HnswAlgorithmConfiguration(name="default-hnsw")],
        profiles=[
            VectorSearchProfile(name="default-profile", algorithm_configuration_name="default-hnsw")
        ],
    )

    index = SearchIndex(name=INDEX_NAME, fields=fields, vector_search=vector_search)
    index_client.create_or_update_index(index)
    print(f"Index '{INDEX_NAME}' created/updated.")


def embed(text: str):
    resp = aoai_client.embeddings.create(input=text, model=embed_deployment)
    return resp.data[0].embedding


def load_and_push():
    with open("kb_dataset.json", "r", encoding="utf-8") as f:
        docs = json.load(f)

    payload = []
    for d in docs:
        resolution_text = " | ".join(d["resolution_steps"])
        combined_text = f"{d['title']}. {d['symptoms']} Steps: {resolution_text} Policy: {d['policy_notes']}"
        payload.append(
            {
                "id": d["id"],
                "category": d["category"],
                "request_type": d["request_type"],
                "title": d["title"],
                "symptoms": d["symptoms"],
                "resolution_steps": resolution_text,
                "policy_notes": d["policy_notes"],
                "confidence_tag": d["confidence_tag"],
                "contentVector": embed(combined_text),
            }
        )

    result = search_client.upload_documents(documents=payload)
    succeeded = sum(1 for r in result if r.succeeded)
    print(f"Uploaded {succeeded}/{len(payload)} documents.")


if __name__ == "__main__":
    create_index()
    load_and_push()
