import {
  getCollaborationLink,
  getCollaborationLinkData,
  isCollaborationLink,
} from "../data";

const roomId = "a1b2c3d4e5f6a7b8c9d0";
const roomKey = "AbCdEfGhIjKlMnOpQrStUv";
const editorToken = "0123456789abcdef0123456789abcdef";

describe("collaboration links", () => {
  it("When a link has no editor token, then the token is null", () => {
    const link = `https://excalidraw.com/#room=${roomId},${roomKey}`;
    expect(isCollaborationLink(link)).toBe(true);
    expect(getCollaborationLinkData(link)).toEqual({
      roomId,
      roomKey,
      editorToken: null,
    });
  });

  it("When a link has an editor token, then it is parsed", () => {
    const link = `https://excalidraw.com/#room=${roomId},${roomKey},${editorToken}`;
    expect(getCollaborationLinkData(link)?.editorToken).toBe(editorToken);
  });

  it("When the editor token is given, then the link includes it", () => {
    expect(getCollaborationLink({ roomId, roomKey, editorToken })).toMatch(
      new RegExp(`#room=${roomId},${roomKey},${editorToken}$`),
    );
    expect(getCollaborationLink({ roomId, roomKey })).toMatch(
      new RegExp(`#room=${roomId},${roomKey}$`),
    );
  });
});
