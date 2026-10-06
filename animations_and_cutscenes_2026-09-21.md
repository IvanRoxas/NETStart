# Animations and Cutscenes Updates
**Date:** September 21, 2026 (03:35 AM)

## Overview
This document summarizes all the visual novel cutscene and animation integration work completed since the last major code pull and merge.

## 1. Cutscene Content & Data Integration
- **Dialogue Injection**: Integrated the `moon.json` data file to supply the engine with structured story dialogues, character assignments, and background paths.
- **Backgrounds**: Copied and mapped all provided staging background images to their appropriate scenes in the Moon levels.
- **Operator Standardization**: Replaced all dialogue instances of "Y/N" with "Operator". The cutscene engine now uses "Operator" as a clean fallback name if the user's name fails to load.

## 2. UI & User Flow Additions
- **Replay vs. Retry**: Updated the `ModuleDetailsClient` component to feature distinct buttons for previously completed levels.
  - **Replay**: Will trigger the full introductory cutscene before launching the level.
  - **Retry**: Bypasses the cutscene and drops the player immediately into the Sandbox level.
- **Sandbox Wrapper Logic**: Modified `sandbox/page.tsx` to actively intercept incoming `missionId` parameters. If a player opens a Moon level (and hasn't elected to skip), it dynamically wraps the sandbox with the `VisualNovelCutscene` component.
- **Story Summaries**: Implemented a skip-friendly modal using `story_summaries.json` that provides players with a quick text summary of the lore they missed when they choose to skip a cutscene.

## 3. Character Sprites & Animation
- **Pixel Art Sprites**: Replaced the default rectangular "holo-card" character profiles with custom-provided pixel art sprites (`Employee`, `Higher Head`, `Oberion`, and `Nova`).
- **Dynamic Positioning**: Adjusted the CSS margins and sizing of the character container so the new sprites sit comfortably layered behind the dialogue box, with their chest and identifying details proudly visible.
- **Operator & Nova Pairing**: Retained the specialized Holo-card design solely for the Operator, but programmed the system to automatically render Nova's sprite alongside the Operator's card whenever they speak.
- **Entrance Animations**: Verified and finalized the dynamic "slide-up" entrance animation (`translate-y-8` to `translate-y-0`) that triggers whenever a character begins speaking a new line, keeping the dialogue sequence feeling responsive and lively.
