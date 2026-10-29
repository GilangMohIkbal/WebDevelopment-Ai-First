# Requirements Document

## Introduction

The Product_Catalog_Service is a REST API built with Node.js and Express that provides product catalog functionality for e-commerce or client applications. The service exposes a single resource, the Product, over a set of HTTP endpoints under `/api/products`. The service supports browsing the catalog, searching by keyword, filtering by category and price range, sorting by name or price, viewing a single product detail, and create, update, partial update, and delete operations. Product data is held in memory and shared across all route handlers for the lifetime of a single server process.

This document was initially approved with 16 requirements for an existing Product_Catalog_Service. Requirements 17–18 below record a subsequent user-approved scope enhancement (PATCH + layered architecture refactor); they were not present at initial approval. Requirements 19–21 further extend the scope to replace in-memory storage with MySQL persistence, transactional write operations, and secure configuration management. The requirements describe observable behavior as implemented and subsequently extended. The acceptance criteria describe intended, testable behavior based on the current source code in `src/app.js`, `src/data/products.js`, `src/routes/products.js`, and `src/utils/validateProduct.js`.

### Scope Override Note

The original Product Requirements Document (`PRD - Product Catalog.md`) defines product requirements PR-001 through PR-007, covering browse, search, filter, sorting, detail, and combination behavior. The original PRD explicitly listed adding, modifying, and deleting products as out of scope. The current assignment rubric mandates full CRUD operations (POST, PUT, DELETE) and API documentation. Per the assignment owner, these latest CRUD and documentation requirements supplement and override the original PRD's CRUD scope limitation. Therefore this requirements document keeps PR-001 through PR-007 valid and extends the Product_Catalog_Service with create, update, delete, validation, error handling, persistence semantics, and API documentation requirements.

### In Scope

- GET list with search, filter, and sort
- GET single product detail
- POST create product
- PUT partial update product (legacy behavior)
- PATCH partial update product (new)
- DELETE product
- Input validation and error handling (HTTP 400 and 404)
- Query parameter validation on the list endpoint
- In-memory data persistence semantics
- API documentation via a Postman collection and usage guide
- MySQL database persistence via connection pool (replaces in-memory storage at runtime)

### Out of Scope

- Authentication and authorization
- Frontend user interface
- Product management workflows beyond the implemented CRUD endpoints
- Shopping cart, checkout, orders, payment, shipping, promotions, and tax
- Integration with external services or suppliers
- Analytics, reporting, and production deployment

## Glossary

- **Product_Catalog_Service**: The REST API service providing product catalog functionality over HTTP, built with Node.js and Express.
- **Product**: A single catalog entry consisting of an id, name, description, category, price, image, and Product_Variants.
- **Product_Variants**: The variants object of a Product, containing a `colorOrSize` array and a `quantity` integer.
- **Dataset**: The collection of Product records held by the Product_Catalog_Service during a Server_Session.
- **Server_Session**: A single running instance of the Product_Catalog_Service process.
- **Query_Parameter**: A URL query string parameter supplied to the GET `/api/products` list endpoint. The supported Query_Parameters are `q`, `category`, `minPrice`, `maxPrice`, and `sort`.
- **Postman_Collection**: The API test collection file that documents and exercises all Product_Catalog_Service endpoints with automated test scripts.
- **Postman_Guide**: The markdown usage guide that describes importing the Postman_Collection and running its test scenarios.
- **Error_Response**: A JSON response body returned by the Product_Catalog_Service when a request cannot be processed, containing a `message` field and, for validation failures, an `errors` array.
- **MySQL_Repository**: The mysqlProductRepository adapter that implements the repository contract using MySQL as the backing store.
- **Connection_Pool**: The mysql2/promise connection pool used by the MySQL_Repository to manage database connections.
- **DB_Session**: A single MySQL connection obtained from the Connection_Pool for the duration of a transaction.
- **Environment_Variable**: A runtime configuration value supplied to the Product_Catalog_Service via a `.env` file loaded by dotenv.

## Requirements

### Requirement 1: Browse Product Catalog

**User Story:** As a prospective customer, I want to view a list of available products, so that I can see the choices in the catalog.

#### Acceptance Criteria

1. WHEN a GET request is sent to `/api/products` without any Query_Parameter, THE Product_Catalog_Service SHALL return HTTP 200 with a response body containing a `data` array of every Product in the Dataset and a `total` field equal to the number of Product records in the Dataset.
2. THE Product_Catalog_Service SHALL include the fields id, name, description, category, price, image, and Product_Variants for each Product in the `data` array.
3. THE Product_Catalog_Service SHALL express every Product price in Rupiah (IDR).

### Requirement 2: Search Products by Keyword

**User Story:** As a prospective customer, I want to search products by keyword, so that I can find products matching a word or phrase without knowing the exact product name.

#### Acceptance Criteria

1. WHEN the `q` Query_Parameter is provided with a non-whitespace keyword, THE Product_Catalog_Service SHALL return only Product records whose name or description contains the keyword as a case-insensitive substring.
2. WHEN the `q` Query_Parameter contains only whitespace, THE Product_Catalog_Service SHALL treat the request as having no search keyword and SHALL apply any other active filters to the full Dataset.

### Requirement 3: Filter by Category

**User Story:** As a prospective customer, I want to filter products by category, so that I can focus on a specific product type.

#### Acceptance Criteria

1. WHEN the `category` Query_Parameter is provided with a non-whitespace value, THE Product_Catalog_Service SHALL return only Product records whose category matches the provided value using a case-insensitive exact comparison.
2. WHEN the `category` Query_Parameter contains only whitespace, THE Product_Catalog_Service SHALL treat the request as having no category filter.

### Requirement 4: Filter by Price Range

**User Story:** As a prospective customer, I want to filter products by a price range, so that I can find products within my budget.

#### Acceptance Criteria

1. WHEN the `minPrice` Query_Parameter is provided as a finite number, THE Product_Catalog_Service SHALL include only Product records whose price is greater than or equal to minPrice.
2. WHEN the `maxPrice` Query_Parameter is provided as a finite number, THE Product_Catalog_Service SHALL include only Product records whose price is less than or equal to maxPrice.
3. WHEN both `minPrice` and `maxPrice` are provided and the value of `minPrice` is greater than the value of `maxPrice`, THE Product_Catalog_Service SHALL return HTTP 400 with an Error_Response stating that minPrice must not exceed maxPrice.
4. WHEN the `minPrice` Query_Parameter or the `maxPrice` Query_Parameter is provided as a non-finite value, THE Product_Catalog_Service SHALL return HTTP 400 with an Error_Response that names the invalid value.
5. WHEN the `minPrice` Query_Parameter or the `maxPrice` Query_Parameter is provided as an empty string, THE Product_Catalog_Service SHALL ignore that parameter.

### Requirement 5: Sort Products

**User Story:** As a prospective customer, I want to sort products by name or price in either direction, so that I can compare options more easily.

#### Acceptance Criteria

1. WHEN the `sort` Query_Parameter equals `name_asc`, THE Product_Catalog_Service SHALL order the results by Product name from A to Z using a case-insensitive comparison.
2. WHEN the `sort` Query_Parameter equals `name_desc`, THE Product_Catalog_Service SHALL order the results by Product name from Z to A using a case-insensitive comparison.
3. WHEN the `sort` Query_Parameter equals `price_asc`, THE Product_Catalog_Service SHALL order the results by Product price from lowest to highest.
4. WHEN the `sort` Query_Parameter equals `price_desc`, THE Product_Catalog_Service SHALL order the results by Product price from highest to lowest.
5. WHEN the `sort` Query_Parameter is provided with a value other than `name_asc`, `name_desc`, `price_asc`, or `price_desc`, THE Product_Catalog_Service SHALL return HTTP 400 with an Error_Response listing the allowed sort values.
6. WHILE sorting is applied, THE Product_Catalog_Service SHALL reorder only the matched results and SHALL preserve which Product records satisfy the active search and filter criteria.

### Requirement 6: View Product Detail

**User Story:** As a prospective customer, I want to view the details of a single product, so that I can understand a product before making a decision.

#### Acceptance Criteria

1. WHEN a GET request is sent to `/api/products/:id` with an id matching an existing Product, THE Product_Catalog_Service SHALL return HTTP 200 with the full Product record including id, name, description, category, price, image, and Product_Variants.
2. WHEN a GET request is sent to `/api/products/:id` with an id that does not match any Product in the Dataset, THE Product_Catalog_Service SHALL return HTTP 404 with an Error_Response stating that the product was not found.

### Requirement 7: Combine Search, Filters, and Sorting

**User Story:** As a prospective customer, I want to combine search, category filter, price filter, and sorting at the same time, so that I can narrow results and order them together.

#### Acceptance Criteria

1. WHEN multiple Query_Parameters are provided together, THE Product_Catalog_Service SHALL return only Product records that satisfy every active criterion among `q`, `category`, `minPrice`, and `maxPrice`.
2. WHEN sorting is combined with search and filters, THE Product_Catalog_Service SHALL apply sorting only to the Product records that satisfy all active search and filter criteria.

### Requirement 8: Empty Results Clarity

**User Story:** As a prospective customer, I want clear feedback when no products match my search or filters, so that I understand the catalog has no matching items.

#### Acceptance Criteria

1. WHEN no Product records satisfy the active search and filter criteria, THE Product_Catalog_Service SHALL return HTTP 200 with `data` as an empty array, `total` equal to 0, and a `message` field explaining that no products matched the given criteria.

### Requirement 9: Create Product

**User Story:** As a client application, I want to create a new product, so that the catalog can be expanded with new entries.

#### Acceptance Criteria

1. WHEN a POST request is sent to `/api/products` with a valid body containing all required fields, THE Product_Catalog_Service SHALL create a new Product record, assign the new Product an id equal to one more than the highest existing Product id, append the new Product to the Dataset, and return HTTP 201 with the created Product record.
2. WHEN a POST request is sent to `/api/products` with a body missing one or more required fields or containing invalid field values, THE Product_Catalog_Service SHALL return HTTP 400 with an Error_Response containing a `message` field and an `errors` array listing each validation failure.

### Requirement 10: Update Product

**User Story:** As a client application, I want to update an existing product, so that I can keep product information current.

#### Acceptance Criteria

1. WHEN a PUT request is sent to `/api/products/:id` with an id matching an existing Product and a valid body, THE Product_Catalog_Service SHALL update only the fields present in the body and return HTTP 200 with the updated Product record.
2. WHEN a PUT request is sent to `/api/products/:id` with an id that does not match any Product in the Dataset, THE Product_Catalog_Service SHALL return HTTP 404 with an Error_Response stating that the product was not found.
3. WHEN a PUT request is sent with a body containing invalid field values, THE Product_Catalog_Service SHALL return HTTP 400 with an Error_Response containing a `message` field and an `errors` array listing each validation failure.
4. WHEN a PUT request provides a partial Product_Variants object, THE Product_Catalog_Service SHALL update only the Product_Variants sub-fields present in the request and SHALL retain the existing values for Product_Variants sub-fields absent from the request.
5. THE Product_Catalog_Service SHALL preserve the existing Product id and SHALL assign the id from the existing Product regardless of any id value present in the request body.

### Requirement 11: Delete Product

**User Story:** As a client application, I want to delete a product, so that I can remove products that are no longer offered.

#### Acceptance Criteria

1. WHEN a DELETE request is sent to `/api/products/:id` with an id matching an existing Product, THE Product_Catalog_Service SHALL remove the Product record from the Dataset and return HTTP 200 with a confirmation message and a `data` field containing the deleted Product record.
2. WHEN a DELETE request is sent to `/api/products/:id` with an id that does not match any Product in the Dataset, THE Product_Catalog_Service SHALL return HTTP 404 with an Error_Response stating that the product was not found.

### Requirement 12: Product Data Structure

**User Story:** As a developer, I want a consistent Product data structure, so that client applications can rely on a stable contract.

#### Acceptance Criteria

1. THE Product_Catalog_Service SHALL represent each Product with an id of type number, a name of type string, a description of type string, a category of type string, a price of type number, an image of type string, and a Product_Variants object.
2. THE Product_Catalog_Service SHALL represent each Product_Variants object with a `colorOrSize` array of non-empty strings and a `quantity` integer.

### Requirement 13: Input Validation for Create and Update

**User Story:** As a developer, I want consistent input validation across create and update operations, so that invalid data is rejected with clear feedback.

#### Acceptance Criteria

1. WHEN the `name`, `description`, `category`, or `image` field is present in a create or update request, THE Product_Catalog_Service SHALL require the field to be a non-empty string.
2. WHEN the `image` field is present in a create or update request, THE Product_Catalog_Service SHALL require the value to be a syntactically valid HTTP or HTTPS URL.
3. WHEN the `price` field is present in a create or update request, THE Product_Catalog_Service SHALL require the value to be a finite number that is greater than or equal to 0.
4. WHEN the `variants` field is present in a create or update request, THE Product_Catalog_Service SHALL require `variants` to be a non-null object that is not an array.
5. WHEN a Product is created and the `variants` field is provided, THE Product_Catalog_Service SHALL require `colorOrSize` to be a non-empty array of non-empty strings and `quantity` to be an integer greater than or equal to 0.
6. WHEN a Product is updated and a partial `variants` object is provided, THE Product_Catalog_Service SHALL validate only the provided `colorOrSize` and/or `quantity` sub-fields against the same constraints, without requiring both sub-fields in the request.
7. WHEN the body of a create or update request is not a JSON object, THE Product_Catalog_Service SHALL return HTTP 400 with an Error_Response containing the message that the body must be a JSON object.
8. WHEN a Product is created, THE Product_Catalog_Service SHALL require all fields to be present in the request body.
9. WHEN a Product is updated, THE Product_Catalog_Service SHALL validate only the fields present in the request body.

### Requirement 14: Query Parameter Validation on the List Endpoint

**User Story:** As a developer, I want validation of query parameters on the list endpoint, so that malformed requests return clear errors instead of server failures.

#### Acceptance Criteria

1. WHEN a Query_Parameter (`q`, `category`, `minPrice`, `maxPrice`, or `sort`) is provided as a non-string value such as an array, THE Product_Catalog_Service SHALL return HTTP 400 with an Error_Response stating that the parameter must be a single text value.

### Requirement 15: In-Memory Data Persistence

**User Story:** As a developer, I want to understand the data persistence behavior, so that I know the lifetime of changes made through the API.

#### Acceptance Criteria

1. THE Product_Catalog_Service SHALL retain create, update, and delete changes for the duration of a single Server_Session.
2. WHEN the Server_Session restarts, THE Product_Catalog_Service SHALL reset the Dataset to the original seed Products.

### Requirement 16: API Documentation

**User Story:** As a developer, I want API documentation covering all endpoints, so that I can test and integrate against the Product_Catalog_Service.

#### Acceptance Criteria

1. THE Product_Catalog_Service SHALL be accompanied by a Postman_Collection that organizes requests into folders covering browse and detail, search, category and price, sorting, combined criteria, and a sequential create, update, and delete mutation flow.
2. THE Postman_Collection SHALL include an automated test script for each request that asserts HTTP status codes and response shape.
3. THE Product_Catalog_Service SHALL be accompanied by a Postman_Guide that describes the steps to import the Postman_Collection and the test scenarios it covers.

### Requirement 17: Partial Update via PATCH

**User Story:** As a client application, I want to update only selected product fields using PATCH, so that I can modify a product without resending unchanged fields.

#### Acceptance Criteria

1. WHEN a PATCH request is sent to `/api/products/:id` with an existing Product id and valid partial JSON body, THE Product_Catalog_Service SHALL return HTTP 200 with the updated Product.
2. WHEN a PATCH body omits Product fields, THE Product_Catalog_Service SHALL preserve the previous values of those fields.
3. WHEN a PATCH body includes only `variants.quantity` or only `variants.colorOrSize`, THE Product_Catalog_Service SHALL modify only that nested field and SHALL preserve the other nested field.
4. WHEN a PATCH request references a nonexistent Product id, THE Product_Catalog_Service SHALL return HTTP 404 with a clear `message`.
5. WHEN a PATCH request contains invalid data or a non-object JSON body, THE Product_Catalog_Service SHALL return HTTP 400 with a `message` and an `errors` array, without persisting changes.
6. THE Product_Catalog_Service SHALL preserve the Product `id` regardless of an `id` value in the PATCH body.
7. WHILE both PUT and PATCH endpoints exist, THE Product_Catalog_Service SHALL retain the preexisting partial-update semantics of PUT for backward compatibility.

### Requirement 18: Separation of Concerns and Testability

**User Story:** As a maintainer, I want HTTP handling, product business operations, validation, and data storage to be separated, so that the service is easier to reason about, test, and change.

#### Acceptance Criteria

1. THE Product_Catalog_Service SHALL separate HTTP routes, controllers, product application services, and the in-memory repository into distinct modules.
2. THE product application service SHALL perform filtering, sorting, and CRUD orchestration without referencing Express request or response objects.
3. THE product application service SHALL depend on an injected repository interface rather than import a concrete in-memory implementation directly.
4. THE HTTP controller SHALL map known application errors to the existing JSON response shapes and HTTP 400 or 404 statuses.
5. WHEN a new application instance is constructed for testing, THE Product_Catalog_Service SHALL use a separate copy of seed data, avoiding unexpected shared mutable state between test instances.
6. THE repository SHALL prevent callers from mutating stored Product records through returned references.
7. THE Product_Catalog_Service SHALL provide automated tests for core behavior and CRUD/PATCH regression cases, runnable through `npm test`.

### Requirement 19: MySQL Persistence

**User Story:** As a developer, I want product data to be stored in MySQL so that data survives server restarts.

#### Acceptance Criteria

1. WHEN the Product_Catalog_Service starts with valid database environment variables, THE Product_Catalog_Service SHALL connect to MySQL using a Connection_Pool and verify the connection before accepting requests.
2. WHEN the database connection fails at startup, THE Product_Catalog_Service SHALL log a safe error message (without exposing credentials) and exit with a non-zero code.
3. THE MySQL_Repository SHALL implement the same repository contract (list, findById, insert, replace, remove) as the in-memory repository so that the service layer requires no changes.
4. THE MySQL_Repository SHALL read product data by joining the `products` table with `product_variant_options` and mapping rows to the JSON API shape: `id` (number), `name`, `description`, `category`, `price` (number, not DECIMAL string), `image`, `variants.colorOrSize` (array of strings), `variants.quantity` (integer).
5. WHEN a GET list or detail request is served from MySQL, THE Product_Catalog_Service SHALL return responses with the same JSON shape and HTTP status codes as the in-memory implementation.
6. THE MySQL_Repository SHALL use parameterized SQL queries for all user-supplied values to prevent SQL injection.
7. WHEN the Product_Catalog_Service is started normally (not in test mode), THE Product_Catalog_Service SHALL use the MySQL_Repository as the active repository.
8. WHEN the Product_Catalog_Service is started for unit testing, THE Product_Catalog_Service SHALL use the in-memory repository so that tests remain isolated from the database.

### Requirement 20: Transactional Write Operations

**User Story:** As a developer, I want create and update operations to be atomic so that a partial failure does not leave inconsistent data across the products and product_variant_options tables.

#### Acceptance Criteria

1. WHEN a POST request successfully creates a product, THE MySQL_Repository SHALL insert into `products` and into `product_variant_options` within a single DB_Session transaction, committing only if both inserts succeed.
2. WHEN a PUT or PATCH request successfully updates a product, THE MySQL_Repository SHALL update the `products` row and replace all `product_variant_options` rows for that product within a single DB_Session transaction.
3. IF any SQL statement within a write transaction fails, THE MySQL_Repository SHALL roll back the transaction and propagate the error so that no partial data is written.
4. THE new Product id SHALL be determined by MySQL AUTO_INCREMENT rather than by calculating MAX(id) in the service layer.
5. WHEN a DELETE request is processed, THE MySQL_Repository SHALL delete the product row; the `product_variant_options` rows SHALL be removed automatically via ON DELETE CASCADE.

### Requirement 21: Secure Configuration and Schema Artifacts

**User Story:** As a developer, I want database credentials and schema artifacts managed safely so that the project can be set up by others without exposing secrets.

#### Acceptance Criteria

1. THE Product_Catalog_Service SHALL read DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, and DB_NAME from Environment_Variables via a `.env` file loaded by dotenv.
2. THE Product_Catalog_Service SHALL provide a `.env.example` file listing the required Environment_Variable names with placeholder values and no real credentials.
3. THE `.env` file SHALL be listed in `.gitignore` so that real credentials are never committed to source control.
4. THE Product_Catalog_Service SHALL provide a `database/schema.sql` file that describes the `products` and `product_variant_options` table definitions matching the existing database schema.
5. THE existing `database/seed_product_catalog.sql` SHALL be preserved unchanged.
6. THE README SHALL document how to create `.env` from `.env.example` and how to start the service with MySQL.
