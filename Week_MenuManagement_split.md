# Phân Chia Công Việc - Menu Management Module (3 người)

**Mục tiêu:** Mỗi người hoàn thành phần việc độc lập, tự chạy test được, khối lượng công việc đều nhau (~3.3 điểm/người), tổng hợp phải phủ toàn bộ yêu cầu từ Week_MenuManagement.md.

**Shared Type Reference:** [shared/types/menu.d.ts](shared/types/menu.d.ts)

---

# 📋 PHẦN I: NỘI DUNG CHIA VIỆC CHO TỪNG NGƯỜI

> **Chú ý:** Đây là phần CHÍNH mô tả công việc cụ thể cho từng thành viên. Đọc kỹ phần của mình trước khi bắt đầu.

---

## Người 1: Categories CRUD + Photos Management (~3.5 điểm)

**Shared Types:** MenuCategory, CreateMenuCategoryDto, UpdateMenuCategoryDto, PaginatedMenuCategories, MenuItemPhoto

### A. Categories CRUD (2 điểm)

#### Yêu cầu chính
- Xây API admin cho categories: create/view/list/update/soft delete
- Validation: name 2–50 chars, displayOrder >=0, status (active/inactive), unique per restaurant
- Sorting: displayOrder (default), name, createdAt
- Response: kèm itemCount (số item trong category)
- Soft delete: chặn delete khi còn active items

#### Endpoints
| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/api/admin/menu/categories` | List categories (filter/sort/page) |
| POST | `/api/admin/menu/categories` | Create new category |
| GET | `/api/admin/menu/categories/:id` | Get category details |
| PUT | `/api/admin/menu/categories/:id` | Update category |
| PATCH | `/api/admin/menu/categories/:id/status` | Update status only |
| DELETE | `/api/admin/menu/categories/:id` | Soft delete |

#### Validation Checklist
- ✅ Name: 2–50 characters, not empty
- ✅ DisplayOrder: non-negative integer
- ✅ Status: enum active/inactive
- ✅ Unique (name + restaurantId) constraint
- ✅ Prevent hard delete if category has active items
- ✅ Error response: 400 with field-level messages

#### Testing Requirements
- Unit: service validation logic
- E2E: create→list→update→deactivate flow (≥5 test cases)
- Edge cases: duplicate name, invalid displayOrder, deactivate with active items

#### Database & Migration
- Table: `menu_categories` (id, restaurant_id, name, description, display_order, status, is_deleted, created_at, updated_at)
- Indexes: (restaurant_id, status), (restaurant_id, name)
- Seed: ≥3 categories for testing

### B. Photos Management (1.5 điểm)

#### Endpoints
| Method | Path | Mô tả |
|--------|------|-------|
| POST | `/api/admin/menu/items/:itemId/photos` | Upload multiple photos |
| DELETE | `/api/admin/menu/items/:itemId/photos/:photoId` | Delete photo |
| PATCH | `/api/admin/menu/items/:itemId/photos/:photoId/primary` | Set primary photo |
| GET | `/api/admin/menu/items/:itemId/photos` | List photos for item |

#### Validation Checklist
- ✅ File type: JPG/PNG/WebP only (validate MIME type)
- ✅ File size: max 5MB per image
- ✅ Random filename: prevent arbitrary path writes
- ✅ Store URL/path in DB (menu_item_photos)
- ✅ Only 1 isPrimary per item
- ✅ Error response: 400 for invalid type/size

#### Testing Requirements
- Unit: MIME validation, filename generation
- E2E: upload→list→set primary→delete flow (≥6 test cases)
- Edge cases: exceed size, invalid type, delete primary photo, upload duplicate

#### Database & Migration
- Table: `menu_item_photos` (id, menu_item_id, url, is_primary, created_at)
- Indexes: (menu_item_id)
- Seed: ≥2 items with photos (1 primary per item)

---

## Người 2: Menu Items CRUD + Business Rules (~3.5 điểm)

**Shared Types:** MenuItem, MenuItemStatus, CreateMenuItemDto, UpdateMenuItemDto, MenuItemQueryDto, PaginatedMenuItems

### Yêu cầu chính
- CRUD items: create/read/update/soft delete
- Validation: name 2–80, price >0, prepTimeMinutes 0–240, status (available/unavailable/sold_out)
- List API: filter (q, categoryId, status, chefRecommended), sort (createdAt, price, popularity), paging
- Business rules: item visible chỉ khi category active + item not deleted + status=available
- Popularity: mock/cache field để sort

### Endpoints
| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/api/admin/menu/items` | List items (filter/sort/page) |
| POST | `/api/admin/menu/items` | Create new item |
| GET | `/api/admin/menu/items/:id` | Get item details |
| PUT | `/api/admin/menu/items/:id` | Update item (can move category) |
| PATCH | `/api/admin/menu/items/:id/status` | Update status only |
| DELETE | `/api/admin/menu/items/:id` | Soft delete |

**Query params ví dụ:**
```
GET /api/admin/menu/items?q=pizza&categoryId=cat-1&status=available&chefRecommended=true&sort=price&order=DESC&page=1&limit=10
```

### Validation Checklist
- ✅ Name: 2–80 characters
- ✅ Price: positive decimal (>0)
- ✅ PrepTimeMinutes: 0–240 range
- ✅ Status: enum only
- ✅ CategoryId: exists & belongs to same restaurant
- ✅ ModifierGroupIds: valid existing groups (optional)
- ✅ Soft delete: mark isDeleted=true, not removed from DB
- ✅ Error response: 400 with field-level messages

### Business Rules (Critical)
- **Item visible to guest** = category.status=active AND item.isDeleted=false AND item.status=available
- **Sold_out items**: return flag in response but disable ordering
- **Popularity field**: calculate as SUM(quantity) from order_items or mock counter
- **Moving between categories**: allowed, update categoryId only

### Testing Requirements
- Unit: validation, filter/sort/paging logic, visibility rules
- E2E: create→list with filters→update category→soft delete flow (≥10 test cases)
- Edge cases: invalid price/prepTime, move to inactive category, filter sold_out items, visibility combinations

### Database & Migration
- Table: `menu_items` (id, restaurant_id, category_id, name, description, price, prep_time_minutes, status, is_chef_recommended, popularity, is_deleted, created_at, updated_at)
- Indexes: (restaurant_id, status), (category_id), (restaurant_id, is_deleted)
- Seed: ≥5 items across ≥2 categories

---

## Người 3: Modifiers + Guest Menu (~3 điểm)

**Shared Types:** ModifierGroup, ModifierOption, ModifierGroupWithOptions, Create/UpdateModifierGroupDto, Create/UpdateModifierOptionDto, AttachModifierGroupsDto, GuestMenuQuery

### A. Modifiers Management (2 điểm)

#### Endpoints
| Method | Path | Mô tả |
|--------|------|-------|
| POST | `/api/admin/menu/modifier-groups` | Create modifier group |
| PUT | `/api/admin/menu/modifier-groups/:id` | Update group |
| POST | `/api/admin/menu/modifier-groups/:id/options` | Add option to group |
| PUT | `/api/admin/menu/modifier-options/:id` | Update option |
| POST | `/api/admin/menu/items/:itemId/modifier-groups` | Attach groups to item |
| DELETE | `/api/admin/menu/items/:itemId/modifier-groups/:groupId` | Detach group from item |
| GET | `/api/admin/menu/modifier-groups` | List all modifier groups |

#### Validation Checklist
- ✅ Group name: required
- ✅ SelectionType: single or multiple only
- ✅ IsRequired: if true, must have min 1 option
- ✅ MinSelections/MaxSelections: validate range logic
- ✅ Option name: required
- ✅ PriceAdjustment: >=0 (non-negative)
- ✅ Status: active/inactive enum
- ✅ Error response: 400 with field-level messages

#### Testing Requirements
- Unit: required/min/max validation logic
- E2E: create group→add options→attach to item→validate price calculation (≥8 test cases)
- Edge cases: no options for required group, invalid min/max range, attach same group twice, detach required group

#### Database & Migration
- Tables:
  - `modifier_groups` (id, restaurant_id, name, selection_type, is_required, min_selections, max_selections, display_order, status, created_at, updated_at)
  - `modifier_options` (id, group_id, name, price_adjustment, status, created_at)
  - `menu_item_modifier_groups` (menu_item_id, group_id, PRIMARY KEY)
- Indexes: (restaurant_id, status) on modifier_groups, (group_id) on modifier_options
- Seed: ≥2 modifier groups with ≥3 options each, ≥3 items attached to modifier groups

### B. Guest Menu Endpoint (1 điểm)

#### Endpoints
| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/api/menu` | Load guest menu (public, no auth) |

#### Query params
- `q` (string): search by item name
- `categoryId` (uuid): filter by category
- `sort` (string): createdAt, price, popularity
- `order` (string): ASC, DESC
- `chefRecommended` (boolean): filter chef picks only
- `page`, `limit`: pagination

#### Response Structure
```json
{
  "data": {
    "categories": [
      {
        "id": "cat-1",
        "name": "Appetizers",
        "items": [
          {
            "id": "item-1",
            "name": "Spring Roll",
            "price": 5.99,
            "primaryPhotoUrl": "https://...",
            "status": "available",
            "isChefRecommended": true,
            "modifierGroups": [
              {
                "id": "group-1",
                "name": "Size",
                "selectionType": "single",
                "isRequired": false,
                "options": [
                  { "id": "opt-1", "name": "Small", "priceAdjustment": 0 },
                  { "id": "opt-2", "name": "Large", "priceAdjustment": 1.50 }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "page": 1,
  "limit": 20,
  "total": 100
}
```

#### Validation Checklist
- ✅ Only categories with status=active
- ✅ Only items with status=available & isDeleted=false
- ✅ Include primaryPhotoUrl (null if no primary)
- ✅ Include modifierGroups with options
- ✅ Price = base + sum(modifier adjustments) - noted in response
- ✅ Pagination: default limit=20, max 100
- ✅ Performance: optimize queries, avoid N+1

#### Testing Requirements
- Unit: visibility logic, price calculation with modifiers
- E2E: filter/sort/paging correctness, modifier price additions (≥8 test cases)
- Edge cases: no results, sold_out items hidden, inactive category items hidden, empty modifiers

---

# 🎯 PHẦN II: SUCCESS CRITERIA & INTEGRATION

> **Chú ý:** Phần này mô tả **tiêu chí hoàn thành** và **cách ghép code** cuối tuần. Đọc để biết khi nào công việc của bạn được coi là xong.

---

## Success Criteria - Tiêu chí hoàn thành

### Mỗi người hoàn thành xong khi:

**Người 1 (Categories + Photos) - 3.5 điểm:**
- ✅ Categories: 6 endpoints hoạt động, validation, soft delete, sorting, itemCount
- ✅ Photos: 4 endpoints hoạt động, MIME/size validation, random filename, set primary
- ✅ E2E tests pass (≥11 test cases: 5 categories + 6 photos)
- ✅ Database migrations & seed created
- ✅ API documentation complete

**Người 2 (Menu Items + Business Rules) - 3.5 điểm:**
- ✅ 6 endpoints hoạt động đúng
- ✅ List API filter/sort/paging working (test ≥4 filters)
- ✅ Visibility rules enforced: category active + item not deleted + status=available
- ✅ ModifierGroupIds support in create/update
- ✅ Move category working
- ✅ E2E tests pass (≥10 test cases: CRUD + filter/sort + visibility + business rules)
- ✅ Database migration & seed created
- ✅ API documentation complete

**Người 3 (Modifiers + Guest Menu) - 3 điểm:**
- ✅ Modifiers: 7 endpoints working, CRUD + attach/detach, required/min/max validation
- ✅ Guest Menu: returns active categories + visible items + photos + modifiers
- ✅ Price calculation correct (base + modifiers)
- ✅ Filters/sort/paging working
- ✅ E2E tests pass (≥16 test cases: 8 modifiers + 8 guest menu)
- ✅ Database migrations & seed created
- ✅ API documentation complete

### Integration Checklist (Cuối tuần)
- ✅ Cả 3 phần chạy cùng nhau không conflict
- ✅ Guest menu endpoint trả về chính xác (categories + items + photos + modifiers)
- ✅ Test toàn flow: admin tạo category → item → photos → modifiers → guest menu hiển thị đúng
- ✅ Seed data: full scenario ready to demo
- ✅ Error handling consistent (400 + field-level messages)
- ✅ Database integrity (foreign keys, indexes)

### Dependencies & Communication
- **Người 2** cần categories table từ **Người 1** (có thể dùng mock/seed data để test độc lập)
- **Người 3** cần items table từ **Người 2** và photos table từ **Người 1** (dùng seed data)
- **Guest Menu (Người 3)** phụ thuộc tất cả, nhưng có thể mock data để test riêng
- Thỏa thuận chung: mỗi người tạo seed data riêng, cuối tuần ghép integration

---

# 📚 PHẦN III: GHI CHÚ CHUNG & QUY ƯỚC

> **Chú ý:** Phần này là **các quy tắc bắt buộc** và **best practices** mà CẢ 3 NGƯỜI đều phải tuân thủ. Đọc kỹ trước khi code.

---

## Ghi chú chung

### Shared Types
- **Phải dùng** naming/field theo [shared/types/menu.d.ts](shared/types/menu.d.ts)
- FE/BE phải khớp, không thay đổi field names

### Security & Architecture
- **Restaurant scoping:** Luôn derive `restaurantId` từ authenticated session, không tin client
- **Soft delete:** Ưu tiên soft delete, giữ lịch sử order
- **Validation:** Server-side bắt buộc, return 400 + field-level error messages
- **N+1 queries:** Tối ưu (join, relation eager load) để tránh N+1

### Development
- **Database migrations:** Mỗi người tạo migration riêng cho entities của mình
- **Seed data:** Mỗi người tạo seed/fixtures riêng để test độc lập
- **Testing:** Unit + E2E, tất cả pass trước merge
- **Error format:** {code, message, errors: {field: [messages]}}

### Deliverables (mỗi người)
1. **Source code:** Entities, DTOs, Controllers, Services, Modules
2. **Tests:** Unit + E2E (tất cả pass)
3. **Database:** Migrations + Seed files
4. **Documentation:** API endpoints, payloads, business rules

### Testing Strategy
- Mỗi người chạy unit test + E2E test riêng (độc lập)
- Ngày cuối: integration test toàn module
- Dùng shared seed/fixtures để test data consistent

### Libraries sử dụng
- **BE:** NestJS, TypeORM, zod/joi (validation), multer (file upload)
- **FE:** React, TypeScript, axios/fetch, react-hook-form


---

## Người 2: Menu Items CRUD + List (filter/sort/paging) + Business Rules

**Shared Types:** MenuItem, MenuItemStatus, CreateMenuItemDto, UpdateMenuItemDto, MenuItemQueryDto, PaginatedMenuItems

### Yêu cầu chính
- CRUD items: create/read/update/soft delete
- Validation: name 2–80, price >0, prepTimeMinutes 0–240, status (available/unavailable/sold_out)
- List API: filter (q, categoryId, status, chefRecommended), sort (createdAt, price, popularity), paging
- Business rules: item visible chỉ khi category active + item not deleted + status=available
- Popularity: mock/cache field để sort

### Endpoints
| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/api/admin/menu/items` | List items (filter/sort/page) |
| POST | `/api/admin/menu/items` | Create new item |
| GET | `/api/admin/menu/items/:id` | Get item details |
| PUT | `/api/admin/menu/items/:id` | Update item (can move category) |
| PATCH | `/api/admin/menu/items/:id/status` | Update status only |
| DELETE | `/api/admin/menu/items/:id` | Soft delete |

### Validation Checklist
- ✅ Name: 2–80 characters
- ✅ Price: positive decimal (>0)
- ✅ PrepTimeMinutes: 0–240 range
- ✅ Status: enum only
- ✅ CategoryId: exists & belongs to same restaurant
- ✅ ModifierGroupIds: valid existing groups (optional)
- ✅ Soft delete: mark isDeleted=true, not removed from DB
- ✅ Error response: 400 with field-level messages

### Business Rules (Critical)
- **Item visible to guest** = category.status=active AND item.isDeleted=false AND item.status=available
- **Sold_out items**: return flag in response but disable ordering
- **Popularity field**: calculate as SUM(quantity) from order_items or mock counter
- **Moving between categories**: allowed, update categoryId only

### Testing Requirements
- Unit: validation, filter/sort/paging logic, visibility rules
- E2E: create→list with filters→update category→soft delete flow (≥8 test cases)
- Edge cases: invalid price/prepTime, move to inactive category, filter sold_out items

### Database & Migration
- Table: `menu_items` (id, restaurant_id, category_id, name, description, price, prep_time_minutes, status, is_chef_recommended, popularity, is_deleted, created_at, updated_at)
- Indexes: (restaurant_id, status), (category_id), (restaurant_id, is_deleted)
- Seed: ≥5 items across ≥2 categories

---

## Người 3: Photos, Modifiers, Guest Menu

**Shared Types:** MenuItemPhoto, ModifierGroup, ModifierOption, ModifierGroupWithOptions, Create/UpdateModifierGroupDto, Create/UpdateModifierOptionDto, AttachModifierGroupsDto, GuestMenuQuery

### A. Photos Management

**Endpoints:**
| Method | Path | Mô tả |
|--------|------|-------|
| POST | `/api/admin/menu/items/:itemId/photos` | Upload multiple photos |
| DELETE | `/api/admin/menu/items/:itemId/photos/:photoId` | Delete photo |
| PATCH | `/api/admin/menu/items/:itemId/photos/:photoId/primary` | Set primary photo |

**Validation Checklist:**
- ✅ File type: JPG/PNG/WebP only (validate MIME type)
- ✅ File size: max 5MB per image
- ✅ Random filename: prevent arbitrary path writes
- ✅ Store URL/path in DB (menu_item_photos)
- ✅ Only 1 isPrimary per item
- ✅ Error response: 400 for invalid type/size

**Testing Requirements:**
- Unit: MIME validation, filename generation
- E2E: upload→list→set primary→delete flow (≥5 test cases)
- Edge cases: exceed size, invalid type, delete primary photo

### B. Modifiers Management

**Endpoints:**
| Method | Path | Mô tả |
|--------|------|-------|
| POST | `/api/admin/menu/modifier-groups` | Create modifier group |
| PUT | `/api/admin/menu/modifier-groups/:id` | Update group |
| POST | `/api/admin/menu/modifier-groups/:id/options` | Add option to group |
| PUT | `/api/admin/menu/modifier-options/:id` | Update option |
| POST | `/api/admin/menu/items/:itemId/modifier-groups` | Attach groups to item |
| DELETE | `/api/admin/menu/items/:itemId/modifier-groups/:groupId` | Detach group from item |

**Validation Checklist:**
- ✅ Group name: required
- ✅ SelectionType: single or multiple only
- ✅ IsRequired: if true, must have min 1 option
- ✅ MinSelections/MaxSelections: validate range logic
- ✅ Option name: required
- ✅ PriceAdjustment: >=0 (non-negative)
- ✅ Status: active/inactive enum
- ✅ Error response: 400 with field-level messages

**Testing Requirements:**
- Unit: required/min/max validation logic
- E2E: create group→add options→attach to item→validate price calculation (≥6 test cases)
- Edge cases: no options for required group, invalid min/max range, attach same group twice

### C. Guest Menu Endpoint

**Endpoints:**
| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/api/menu` | Load guest menu (public, no auth) |

**Query params:**
- `q` (string): search by item name
- `categoryId` (uuid): filter by category
- `sort` (string): createdAt, price, popularity
- `order` (string): ASC, DESC
- `chefRecommended` (boolean): filter chef picks only
- `page`, `limit`: pagination

**Validation Checklist:**
- ✅ Only categories with status=active
- ✅ Only items with status=available & isDeleted=false
- ✅ Include primaryPhotoUrl (null if no primary)
- ✅ Include modifierGroups with options
- ✅ Price = base + sum(modifier adjustments)
- ✅ Pagination: default limit=20, max 100
- ✅ Performance: optimize queries, avoid N+1

**Testing Requirements:**
- Unit: visibility logic, price calculation with modifiers
- E2E: filter/sort/paging correctness, modifier price additions (≥8 test cases)
- Edge cases: no results, sold_out items hidden, inactive category items hidden

### D. Database & Migration

**Tables:**
- `menu_item_photos` (id, menu_item_id, url, is_primary, created_at)
- `modifier_groups` (id, restaurant_id, name, selection_type, is_required, min_selections, max_selections, display_order, status, created_at, updated_at)
- `modifier_options` (id, group_id, name, price_adjustment, status, created_at)
- `menu_item_modifier_groups` (menu_item_id, group_id, PRIMARY KEY)

**Indexes:**
- (menu_item_id) on menu_item_photos
- (restaurant_id, status) on modifier_groups
- (group_id) on modifier_options

**Seed:**
- ≥2 modifier groups with ≥3 options each
- ≥3 items attached to modifier groups
- ≥2 items with photos (1 primary per item)

---

## Success Criteria & Integration

### Mỗi người hoàn thành xong khi:

**Người 1 (Categories) - 2 điểm:**
- ✅ 6 endpoints hoạt động đúng
- ✅ Validation rules enforce (unique name, displayOrder range, status enum)
- ✅ Soft delete implemented (chặn delete nếu có active items)
- ✅ Sorting works (displayOrder default, name, createdAt)
- ✅ Response includes itemCount
- ✅ E2E tests pass (≥5 test cases)
- ✅ Database migration & seed created

**Người 2 (Menu Items) - 4 điểm:**
- ✅ 6 endpoints hoạt động đúng
- ✅ List API filter/sort/paging working (test ≥3 filters)
- ✅ Visibility rules enforced: category active + item not deleted + status=available
- ✅ ModifierGroupIds support in create/update
- ✅ Move category working
- ✅ E2E tests pass (≥8 test cases: CRUD + filter/sort + visibility)
- ✅ Database migration & seed created

**Người 3 (Photos, Modifiers, Guest Menu) - 4 điểm:**
- ✅ Photos: upload/delete/set-primary working (≥5 E2E tests)
- ✅ Modifiers: CRUD + attach/detach working (≥6 E2E tests)
- ✅ Guest Menu: returns active categories + visible items + modifiers (≥8 E2E tests)
- ✅ Price calculation correct (base + modifiers)
- ✅ Filters/sort/paging working
- ✅ Database migrations & seed created

### Integration Checklist (Cuối tuần)
- ✅ Cả 3 phần chạy cùng nhau không conflict
- ✅ Guest menu endpoint trả về chính xác (categories + items + photos + modifiers)
- ✅ Test toàn flow: admin tạo category → item → photos → modifiers → guest menu hiển thị đúng
- ✅ Seed data: full scenario ready to demo
- ✅ Error handling consistent (400 + field-level messages)

---

## Ghi chú chung

### Shared Types
- **Phải dùng** naming/field theo [shared/types/menu.d.ts](shared/types/menu.d.ts)
- FE/BE phải khớp, không thay đổi field names

### Security & Architecture
- **Restaurant scoping:** Luôn derive `restaurantId` từ authenticated session, không tin client
- **Soft delete:** Ưu tiên soft delete, giữ lịch sử order
- **Validation:** Server-side bắt buộc, return 400 + field-level error messages
- **N+1 queries:** Tối ưu (join, relation eager load) để tránh N+1

### Development
- **Database migrations:** Mỗi người tạo migration riêng cho entities của mình
- **Seed data:** Mỗi người tạo seed/fixtures riêng để test độc lập
- **Testing:** Unit + E2E, tất cả pass trước merge
- **Error format:** {code, message, errors: {field: [messages]}}

### Deliverables (mỗi người)
1. **Source code:** Entities, DTOs, Controllers, Services, Modules
2. **Tests:** Unit + E2E (tất cả pass)
3. **Database:** Migrations + Seed files
4. **Documentation:** API endpoints, payloads, business rules

- Cấu trúc file gợi ý:
```
Person 1 (Categories):

backend/
  src/
    modules/
      menu-categories/
        ├── category.entity.ts          # MenuCategory entity TypeORM
        ├── category.dto.ts            # CreateMenuCategoryDto, UpdateMenuCategoryDto
        ├── categories.controller.ts    # GET/POST/PUT/PATCH endpoints
        ├── categories.service.ts       # CRUD logic, validation, sorting
        ├── categories.module.ts        # NestJS module config
        └── __tests__/
            └── categories.service.spec.ts
  test/
    └── categories.e2e-spec.ts         # E2E: create/list/update/filter/sort/deactivate

frontend/
  src/
    services/
      └── menuCategoryApi.ts           # API client for categories
    features/
      └── admin-menu/
          ├── CategoryList.tsx          # List categories with sort/filter
          ├── CategoryForm.tsx          # Create/Update form
          └── CategoryManagement.tsx    # Main component
```

## Người 2: Menu Items CRUD + List (filter/sort/paging) + Business Rules
- Dùng shared types: MenuItem, MenuItemStatus, CreateMenuItemDto, UpdateMenuItemDto, MenuItemQueryDto, PaginatedMenuItems trong [shared/types/menu.d.ts](shared/types/menu.d.ts).
- Xây API admin cho items: create/view/list/update/soft delete với validation (name 2–80, price >0, prepTimeMinutes 0–240, status MenuItemStatus, isChefRecommended). Cho phép modifierGroupIds trong create/update; di chuyển item giữa categories.
- List API: filter q (name contains), categoryId, status, chefRecommended; sort by createdAt, price, popularity; pagination page/limit. Tính/giả lập popularity (counter hoặc mock field `popularity`).
- Business rules: item visible khi category active, item not deleted, status available (hoặc hiển thị disabled nếu unavailable/sold_out). Sold out không add to cart (flag/logic trong response/test).
- DB/migration (nếu cần) cho bảng items (+ indexes, isDeleted, popularity cache field nếu dùng). Seed mẫu để test filter/sort/paging.
- Viết test e2e/unit: create invalid price/prepTime/name, update status, move category, soft delete hides from guest list, filter/sort/paging correctness.
- Tài liệu ngắn: endpoint, query params filter/sort/paging, business rules.
- Cấu trúc file gợi ý:
```
Person 2 (Menu Items):

backend/
  src/
    modules/
      menu-items/
        ├── menu-item.entity.ts        # MenuItem entity TypeORM (id, name, price, prepTimeMinutes, status, etc.)
        ├── menu-item.dto.ts           # CreateMenuItemDto, UpdateMenuItemDto, MenuItemQueryDto
        ├── items.controller.ts        # GET/POST/PUT/DELETE endpoints, @Query() for filters
        ├── items.service.ts           # CRUD, filter/sort/paging logic, visibility rules
        ├── items.module.ts            # NestJS module config
        └── __tests__/
            └── items.service.spec.ts
  test/
    └── items.e2e-spec.ts             # E2E: create/list/update/filter/sort/paging/soft delete

frontend/
  src/
    services/
      └── menuItemApi.ts              # API client for items (filter, sort, paging)
    features/
      └── admin-menu-items/
          ├── ItemList.tsx            # List items with filter/sort/paging UI
          ├── ItemForm.tsx            # Create/Update form with validation
          ├── FilterBar.tsx           # Q, category, status, chef recommended filters
          └── ItemManagement.tsx      # Main component
```

## Người 3: Photos, Modifiers, Guest Menu Endpoint
- Dùng shared types: MenuItemPhoto, ModifierGroup, ModifierOption, ModifierGroupWithOptions, Create/UpdateModifierGroupDto, Create/UpdateModifierOptionDto, AttachModifierGroupsDto, GuestMenuQuery trong [shared/types/menu.d.ts](shared/types/menu.d.ts).
- Photos: API upload multiple JPG/PNG/WebP, size limit, random filename; store URL/path; manage add/remove/set primary (isPrimary). Validation MIME/extension; tránh arbitrary path writes. DB/migration cho menu_item_photos. Tests: upload invalid type/size, set primary, remove photo.
- Modifiers: API create/update modifier groups (selectionType single/multiple, isRequired, min/max, displayOrder, status) và options (name, priceAdjustment>=0, status). Attach/detach groups to items. Validate required/min/max logic. DB/migration cho groups, options, item<->group link; seed mẫu.
- Guest menu endpoint: trả về categories active + items (respect visibility rules) + primaryPhotoUrl/photos + modifierGroups/options; hỗ trợ q, categoryId, sort=popularity/price/createdAt, chefRecommended, page/limit. Đảm bảo giá = base + modifiers adjustments (logic/notes).
- Tests e2e/unit: upload photo flow, primary swap, modifier validation (required/min/max), attach groups, guest menu filters/sort/paging, price calculation with modifiers.
- Tài liệu ngắn: endpoints cho photos/modifiers/guest menu, payload/params, visibility rules.
- Cấu trúc file gợi ý:
```
Person 3 (Photos, Modifiers, Guest Menu):

backend/
  src/
    modules/
      menu-item-photos/
        ├── menu-item-photo.entity.ts  # MenuItemPhoto entity (isPrimary, url)
        ├── photos.controller.ts       # POST upload, DELETE, PATCH set-primary
        ├── photos.service.ts          # Upload handler, validation (MIME, size), random filename
        ├── photos.module.ts           # NestJS module, multer config
        └── __tests__/
            └── photos.service.spec.ts
      modifiers/
        ├── modifier-group.entity.ts   # ModifierGroup entity
        ├── modifier-option.entity.ts  # ModifierOption entity
        ├── item-modifier.entity.ts    # Join table: menu_item_id <-> modifier_group_id
        ├── modifiers.controller.ts    # POST/PUT/DELETE groups & options, attach/detach
        ├── modifiers.service.ts       # CRUD, validation (required/min/max)
        ├── modifiers.module.ts        # NestJS module config
        └── __tests__/
            └── modifiers.service.spec.ts
      guest-menu/
        ├── guest-menu.controller.ts   # GET /api/menu (public, no auth)
        ├── guest-menu.service.ts      # Fetch active categories, visible items, modifiers, photos
        ├── guest-menu.module.ts       # NestJS module config
        └── __tests__/
            └── guest-menu.service.spec.ts
  test/
    ├── photos.e2e-spec.ts            # E2E: upload/remove/set-primary
    ├── modifiers.e2e-spec.ts         # E2E: create/update/attach groups
    └── guest-menu.e2e-spec.ts        # E2E: filters/sort/paging/visibility rules

frontend/
  src/
    services/
      ├── menuMediaApi.ts             # API client for photo upload/delete/primary
      └── modifierApi.ts              # API client for modifiers
    features/
      admin-menu-media/
        ├── PhotoUpload.tsx           # Multi-file upload, drag-drop
        ├── PhotoList.tsx             # Display photos, set primary, remove
        └── PhotoManager.tsx          # Main component
      admin-modifiers/
        ├── ModifierGroupForm.tsx     # Create/Update modifier groups
        ├── ModifierOptionForm.tsx    # Create/Update options
        └── ModifierManager.tsx       # Attach/detach to items
      guest-menu/
        ├── GuestMenuPage.tsx         # Main guest menu view
        ├── MenuFilters.tsx           # Q, category, sort, chef recommended
        ├── MenuItemCard.tsx          # Display item + modifiers + price
        └── ModifierSelector.tsx      # UI for selecting modifiers (single/multi)
```

## Ghi chú chung
- Phải dùng chung naming/field theo [shared/types/menu.d.ts](shared/types/menu.d.ts) để FE/BE khớp.
- Mỗi người có thể tạo seed/test data riêng để chạy test độc lập.
- Ưu tiên soft delete, giữ lịch sử order.
- Trả về lỗi 400 field-level cho validation.

## Cây thư mục gợi ý (tổng quan)

```
packages/
  backend/
    src/
      modules/
        menu-categories/
          category.entity.ts
          category.dto.ts
          categories.controller.ts
          categories.service.ts
          categories.module.ts
          __tests__/ (tùy chọn)
        menu-items/
          menu-item.entity.ts
          menu-item.dto.ts
          items.controller.ts
          items.service.ts
          items.module.ts
          __tests__/ (tùy chọn)
        menu-item-photos/
          menu-item-photo.entity.ts
          photos.controller.ts
          photos.service.ts
          photos.module.ts
          __tests__/ (tùy chọn)
        modifiers/
          modifier-group.entity.ts
          modifier-option.entity.ts
          item-modifier.entity.ts
          modifiers.controller.ts
          modifiers.service.ts
          modifiers.module.ts
          __tests__/ (tùy chọn)
        guest-menu/
          guest-menu.controller.ts
          guest-menu.service.ts
          __tests__/ (tùy chọn)
    test/
      categories.e2e-spec.ts
      items.e2e-spec.ts
      photos.e2e-spec.ts
      modifiers.e2e-spec.ts
      guest-menu.e2e-spec.ts

  frontend/
    src/
      services/
        menuCategoryApi.ts
        menuItemApi.ts
        menuMediaApi.ts
        modifierApi.ts
      features/
        admin-menu/
          (list/filter/category management)
        admin-menu-items/
          (item list/form)
        admin-menu-media/
          (photos upload/set primary)
        guest-menu/
          (guest menu display, filters/sort)

shared/
  types/
    menu.d.ts
    table.d.ts
```
