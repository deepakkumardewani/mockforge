import builder from "../builder";

/** Shared delete payload — mirrors REST `{ deleted, id }`. */
builder.objectType("DeleteResult", {
  fields: (t) => ({
    deleted: t.exposeBoolean("deleted"),
    id: t.exposeString("id"),
  }),
});
