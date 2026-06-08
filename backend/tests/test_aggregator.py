import pytest
from backend.app.aggregator import classify_category, pre_filter_articles, deduplicate_articles

def test_classify_category_heuristics():
    # hardware-gpus
    assert classify_category('NVIDIA announces Blackwell B200 GPU', '') == 'hardware-gpus'
    assert classify_category('TPU v5p hardware updates', '') == 'hardware-gpus'

    # mlops-devops
    assert classify_category('Configuring Kubernetes for MLOps', '') == 'mlops-devops'
    assert classify_category('Docker container orchestration', '') == 'mlops-devops'

    # dev-tools
    assert classify_category('Vite 5 release notes', '') == 'dev-tools'
    assert classify_category('Using Rust for compiler design', '') == 'dev-tools'

    # ai-models & big-tech
    assert classify_category('Google releases Gemini 2.5 Flash', '') == 'ai-models'
    assert classify_category('OpenAI releases new GPT-5 model', '') == 'ai-models'
    assert classify_category('Google Search engine updates', '') == 'big-tech'

def test_pre_filter_articles():
    input_data = [
        { 'title': 'Serious OpenAI update', 'url': 'https://foo.com', 'contentSnippet': 'OpenAI updates API' },
        { 'title': 'Check out this funny cat video', 'url': 'https://cat.com', 'contentSnippet': 'cat joke video' },
        { 'title': 'Show HN: check out my gaming channel', 'url': 'https://game.com', 'contentSnippet': 'Check it out' },
        { 'title': 'Show HN: Open Source Rust compiler', 'url': 'https://rust.com', 'contentSnippet': 'Cool compiler' }
    ]

    filtered = pre_filter_articles(input_data)
    assert len(filtered) == 2
    assert filtered[0]['title'] == 'Serious OpenAI update'
    assert filtered[1]['title'] == 'Show HN: Open Source Rust compiler'

def test_deduplicate_articles():
    input_data = [
        { 'title': 'Google Gemini 2.5', 'url': 'https://gemini.com' },
        { 'title': 'Google Gemini 2.5!!!', 'url': 'https://gemini-alt.com' }, # normalized title is same
        { 'title': 'Other title', 'url': 'https://gemini.com' }, # url is same
        { 'title': 'Unique Title', 'url': 'https://unique.com' }
    ]

    deduped = deduplicate_articles(input_data)
    assert len(deduped) == 2
    assert deduped[0]['title'] == 'Google Gemini 2.5'
    assert deduped[1]['title'] == 'Unique Title'
