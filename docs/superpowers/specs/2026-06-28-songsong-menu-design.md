# Songsong Menu Design

**Date:** 2026-06-28

## 1. Product Goal

Build a WeChat Mini Program for a calm, visually polished home recipe library.

The product should help users:

1. log in quickly
2. browse recipes comfortably
3. upload recipes with minimal friction
4. use AI as an assistant for dish-name and ingredient entry

The first release should feel like a lightweight recipe product, not a recipe community and not a collaborative task manager.

## 2. Product Thesis

### Primary product line

`Songsong Menu` is first a **lightweight recipe library**.

That means the core loop is:

- log in
- browse recipes
- upload recipes
- use AI to speed up recipe entry

### Why this matters

The previous version of the scope overloaded MVP by mixing two different product lines:

- recipe management
- collaborative dish-request management

Those are related, but they are not the same product. If both are built at once, the MVP loses focus, permissions become unclear, and implementation risk rises sharply.

## 3. Product Roadmap Split

### Phase 1: Recipe Library MVP

Phase 1 is the release to build first.

Included:

- login / onboarding
- recipe list browsing
- recipe upload
- AI-assisted dish-name and ingredient recognition
- personal recipe management in `My`

Not included:

- collaborative dish requests
- shared pending boards
- request status workflow
- invite or access scopes for requests

### Phase 2: Collaborative Dish Requests

Phase 2 is a separate module after Phase 1 is stable.

Included direction:

- logged-in users request dishes
- requests belong to a lightweight shared board or invited space
- host/owner manages request status
- requesters can see status updates
- notes such as `少辣` or `周五晚饭`

This is a valid next step, but it should not define Phase 1 architecture.

## 4. Market Reference

Useful references:

- [下厨房](https://www.xiachufang.com/)
- [香哈](https://www.xiangha.com/)
- [美食天下](https://home.meishichina.com/recipe.html)

### What to borrow

- recipe-first information architecture
- large dish imagery
- visible ingredient summaries
- category browsing

### What not to copy into Phase 1

- overloaded home portals
- social feed complexity
- deep interaction layers
- large-form recipe editing

## 5. Phase 1 Scope

### 5.1 Login / Registration

- WeChat login is the primary entry
- first login acts as onboarding
- collect nickname on first login
- phone number is optional and not required for MVP

Registration should not be a separate complex account flow.

### 5.2 Recipe Browsing

- browse shared recipe list
- see recipe cover, dish name, and ingredient summary
- filter by basic categories

Suggested categories:

- 全部
- 家常菜
- 汤羹
- 快手菜
- 轻食

### 5.3 Recipe Upload

- upload one dish photo
- enter dish name
- enter ingredients
- publish recipe

### 5.4 AI-Assisted Recognition

AI is part of Phase 1, but it is an assistant, not an authority.

AI rules for MVP:

1. AI results are always suggestion values, never locked values
2. AI recognition failure must not block recipe publishing
3. If AI returns empty or incomplete results, the user must see a clear prompt to complete fields manually

Expected flow:

- user uploads image
- user taps `AI识别`
- system suggests dish name and ingredients
- user can edit both fields freely
- user can still publish manually even if AI fails

## 6. Phase 1 Out of Scope

- recipe detail with full steps
- cooking duration
- difficulty level
- likes/comments
- favorites
- ingredient search
- recommendation algorithm
- collaborative dish requests
- friend graph
- request boards
- request status workflow

## 7. Core User Flows

### Flow A: First login

1. User opens the mini program
2. User sees welcome/login screen
3. User taps WeChat login
4. If first login, user fills nickname
5. User enters the recipe list

### Flow B: Browse recipes

1. User lands on `Discover`
2. User sees featured visual area and recipe cards
3. User filters by category if needed
4. User continues browsing

### Flow C: Upload with AI assistance

1. User enters `Upload`
2. User uploads or takes a dish photo
3. User can tap `AI识别`
4. System suggests dish name and ingredients
5. User edits the fields if needed
6. User publishes recipe
7. Recipe appears in the shared list and in `My`

## 8. Information Architecture For Phase 1

### Bottom navigation

Use three tabs:

1. `Discover`
2. `Upload`
3. `My`

### Page structure

#### 8.1 Login page

Purpose:

- establish brand tone
- reduce entry friction

Main elements:

- brand title
- short welcome line
- hero visual
- nickname input for first login
- WeChat login button

#### 8.2 Discover page

Purpose:

- make recipe browsing feel calm and visual

Main elements:

- soft visual header area
- category chips
- recipe cards list

Card fields:

- cover image
- dish name
- ingredient summary

#### 8.3 Upload page

Purpose:

- let users create a recipe in a short, forgiving flow

Main elements:

- photo upload area
- AI recognition button
- editable dish-name input
- editable ingredients input
- AI feedback hint
- publish button

#### 8.4 My page

Purpose:

- show user info
- show recipes created by the current user

Main elements:

- nickname
- recipe count
- uploaded recipe list

## 9. Visual Direction

Confirmed direction:

- white as the primary base
- light pink gradient as a soft accent
- black as the main text color

Visual keywords:

- clean
- airy
- soft
- polished
- modern

Usage rules:

- white should dominate the layout
- pink should be used as atmosphere and soft emphasis
- black text keeps hierarchy strong
- avoid overly cute or saturated pink

Component style:

- rounded cards
- soft border lines
- restrained shadow
- generous spacing
- large image blocks
- one clear secondary action for AI recognition

## 10. Data Model For Phase 1

### User

- `id`
- `wechat_open_id`
- `nickname`
- `avatar_url`
- `phone_number` (optional)
- `created_at`

### Recipe

- `id`
- `owner_user_id`
- `photo_url`
- `name`
- `ingredients_text`
- `ai_name_suggestion`
- `ai_ingredients_suggestion`
- `category`
- `created_at`
- `updated_at`

For MVP, `ingredients_text` can stay as plain text.

## 11. Phase 2 Direction: Collaborative Dish Requests

Phase 2 should be designed as a **lightweight invited request space**, not as an unrestricted global request pool.

### Product rule

A request must be addressed to a clear owner.

Recommended default:

- each request belongs to a `space` or `board`
- each board has one `host_owner_user_id`
- recipes become requestable only inside that board context

This avoids the problem of “all logged-in users can request anything from anyone”.

### Access rule

No friend graph is required.

Recommended access model:

- login is required before requesting
- users enter a request board through a lightweight invite or shared entry
- no pre-added friend relationship is required

This keeps the flow light without turning the whole product into an uncontrolled global queue.

### Minimum Phase 2 request model

#### Dish Request

- `id`
- `board_id`
- `space_id`
- `recipe_id`
- `owner_user_id`
- `requester_user_id`
- `requester_nickname`
- `note`
- `status`
- `visibility_scope`
- `status_updated_by`
- `status_updated_at`
- `created_at`
- `updated_at`

### Minimum Phase 2 behaviors

- requester can submit a request with optional note
- host can change status to `待做 / 已安排 / 已完成`
- requester can see status changes
- requester can see a `我点过的菜` view
- login gate blocks unauthenticated requesting and returns user to the request context after login

## 12. Technical Direction

Recommended implementation direction:

- native WeChat Mini Program frontend
- WeChat Cloud Development for storage and cloud functions
- object storage for recipe photos
- one backend AI adapter so the AI provider can be swapped without changing the mini program UI

Phase 1 should optimize for shipping a small, stable, visually coherent recipe product.

## 13. Scope Check

Phase 1 is intentionally narrow:

- one primary product line
- four concrete user outcomes
- limited data model
- AI as assisted input only
- no collaborative workflow yet

This is the right level of scope for the first implementation plan.
