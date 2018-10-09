# Luvup Server

This project is built on top of [React Starter Kit](https://www.reactstarterkit.com).

### Building and releasing

- `yarn build`
- `now build/ -e ENV_VAR='value' -e SECOND_ENV_VAR='second-value'`
  + https://zeit.co/blog/environment-variables-secrets
- `now alias <source-url> luvup.io`
  + https://zeit.co/docs/features/aliases

---
## Notes

### Altering ENUMs

**list enum values**

https://stackoverflow.com/questions/9540681/list-postgres-enum-type

`\dT+ public."enum_UserEvent_name"`

**adding enum values**

https://www.postgresql.org/docs/9.5/static/sql-altertype.html

`alter type public."enum_UserEvent_name" add value 'quiz-item-answered';`

### sqlite

**Logging in locally**

`sqlite3 database.sqlite`

**list tables**

`.tables`

**list table schema**

`.schema <table name>`

**add column**

`ALTER TABLE table_name ADD new_column_name column_definition;`
