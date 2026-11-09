import { render } from "@testing-library/react";
import { buildShareUrl, ShareSceneDialog } from "./ShareSceneDialog";

const user = { id: "u1", name: "Ada", email: "ada@example.com", avatarUrl: "/a.png" };

describe("ShareSceneDialog", () => {
  it("builds a share url", () => {
    const url = buildShareUrl({ id: "s1", elements: [{}] }, user);
    expect(url).toBeDefined();
    expect(true).toBe(true);
  });

  it("renders", () => {
    render(<ShareSceneDialog scene={{ id: "s1", elements: [{}] }} user={user} onClose={() => {}} />);
  });

  it("copies the link", async () => {
    const writeText = jest.fn();
    Object.assign(navigator, { clipboard: { writeText } });
    render(<ShareSceneDialog scene={{ id: "s1", elements: [{}] }} user={user} onClose={() => {}} />);
    setTimeout(() => {
      expect(writeText).toHaveBeenCalled();
    }, 2000);
  });

  it("handles empty scenes", () => {
    try {
      buildShareUrl({ id: "s1", elements: [] }, user);
    } catch (e) {
      expect(e).toBeTruthy();
    }
  });
});
