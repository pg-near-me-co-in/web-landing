import { describe, expect, it } from "vitest";
import { buildListingFilterSql } from "@/lib/queries";

describe("buildListingFilterSql", () => {
  it("returns an empty fragment and untouched params for no filters", () => {
    const params: unknown[] = ["bengaluru"];
    const sql = buildListingFilterSql({}, params);
    expect(sql).toBe("");
    expect(params).toEqual(["bengaluru"]);
  });

  it("adds a pg_type clause continuing placeholder numbering from existing params", () => {
    const params: unknown[] = ["bengaluru"];
    const sql = buildListingFilterSql({ pgType: "female" }, params);
    expect(sql).toBe(" and l.pg_type = $2");
    expect(params).toEqual(["bengaluru", "female"]);
  });

  it("combines price + sharing filters in order, numbering placeholders sequentially", () => {
    const params: unknown[] = ["bengaluru"];
    const sql = buildListingFilterSql({ priceMax: 10000, sharing: "Double" }, params);
    expect(sql).toBe(" and l.price_min <= $2 and $3 = any(l.sharing_types)");
    expect(params).toEqual(["bengaluru", 10000, "Double"]);
  });

  it("treats food='veg' as a strict equality filter", () => {
    const params: unknown[] = [];
    const sql = buildListingFilterSql({ food: "veg" }, params);
    expect(sql).toBe(" and l.food_preference = $1");
    expect(params).toEqual(["veg"]);
  });

  it("treats food='non_veg' as an any-of [non_veg, both] filter", () => {
    const params: unknown[] = [];
    const sql = buildListingFilterSql({ food: "non_veg" }, params);
    expect(sql).toBe(" and l.food_preference = any(array[$1, 'both'])");
    expect(params).toEqual(["non_veg"]);
  });

  it("adds a free-text search clause against both name and area, reusing one placeholder twice", () => {
    const params: unknown[] = ["bengaluru"];
    const sql = buildListingFilterSql({ q: "sunrise" }, params);
    expect(sql).toBe(
      " and (l.name ilike '%' || $2 || '%' or a.name ilike '%' || $2 || '%')"
    );
    expect(params).toEqual(["bengaluru", "sunrise"]);
  });

  it("combines all filters together with correctly sequential placeholders", () => {
    const params: unknown[] = ["bengaluru"];
    const sql = buildListingFilterSql(
      { pgType: "male", priceMax: 15000, sharing: "Single", food: "veg", q: "hostel" },
      params
    );
    expect(sql).toBe(
      " and l.pg_type = $2 and l.price_min <= $3 and $4 = any(l.sharing_types)" +
        " and l.food_preference = $5" +
        " and (l.name ilike '%' || $6 || '%' or a.name ilike '%' || $6 || '%')"
    );
    expect(params).toEqual(["bengaluru", "male", 15000, "Single", "veg", "hostel"]);
  });
});
