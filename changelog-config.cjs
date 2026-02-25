const github = require('@changesets/changelog-github');

const defaultFunctions = github.default;

/** @type {import('@changesets/types').ChangelogFunctions} */
const changelogFunctions = {
  getDependencyReleaseLine: defaultFunctions.getDependencyReleaseLine,
  getReleaseLine: async (changeset, type, options) => {
    const line = await defaultFunctions.getReleaseLine(changeset, type, options);
    // Move "Thanks @user!" from prefix to end of first line
    return line.replace(/ Thanks (.+?)! -/, ' -').replace(/^(\n\n- .+?)$/m, (_, match) => {
      // Extract user from the original line before replacement
      const userMatch = line.match(/ Thanks (.+?)!/);
      if (userMatch) {
        return `${match} — ${userMatch[1]}`;
      }
      return match;
    });
  },
};

module.exports = { default: changelogFunctions };
