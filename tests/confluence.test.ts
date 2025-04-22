import { beforeEach, describe, expect, it } from "vitest";
import { ConfluenceClient } from "../src/confluence.js";

describe("Confluence", () => {
  let confluenceClient: ConfluenceClient;
  beforeEach(() => {
    confluenceClient = new ConfluenceClient();
  });

  it("should be able to get the content of a confluence page", async () => {
    const pageContent = await confluenceClient.getPageContent("1490644779");
    expect(pageContent).toBeDefined();
  });
});
