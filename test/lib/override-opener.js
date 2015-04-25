import proxyquire from "proxyquire";

// Spy of opener package.
export function opener(url, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = null;
  }
  opener.calls.push({url, options, callback});

  if (typeof callback === "function") {
    callback(null);
  }
}
opener.calls = [];

// Override require function in order to return spy of opener.
proxyquire("../../src/show-changelogs", {opener});
