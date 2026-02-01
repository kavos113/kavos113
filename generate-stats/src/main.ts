import { graphql } from "@octokit/graphql";
import type { Repository, User } from "@octokit/graphql-schema";
import { generateStats } from "./svg";

const GET_LANGUAGE_STATS = `
query {
  user(login: "kavos113") {
    repositories(first: 100, isArchived: false, ownerAffiliations: OWNER) {
      nodes {
        name
        languages(first: 10, orderBy: {
          field: SIZE, 
          direction: DESC
        }) {
          edges {
            size
            node {
              name
              color
            }
          }
        }
      }
    }
  }
}
`;

export const fetchLanguageStats = async () => {
  const response = await graphql<{
    user: User;
  }>(GET_LANGUAGE_STATS, {
    headers: {
      authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    },
  });

  return response.user.repositories.nodes;
};

export type LanguageStat = {
  name: string;
  size: number;
  color: string | null;
};

export const aggregateLanguageStats = (
  repos: Repository[],
): Record<string, LanguageStat> => {
  const languageStats: Record<string, LanguageStat> = {};
  const filters = process.env.EXCLUDE_REPOS?.split(",") || [];

  repos.forEach((repo) => {
    if (filters.includes(repo.name)) {
      return;
    }
    repo.languages?.edges?.forEach((edge) => {
      const langName = edge?.node.name || "Unknown";
      if (!languageStats[langName]) {
        languageStats[langName] = {
          name: langName,
          size: 0,
          color: edge?.node.color || null,
        };
      }
      languageStats[langName].size += edge?.size || 0;
    });
  });

  return languageStats;
};

fetchLanguageStats().then((repos) => {
  const aggregatedStats = aggregateLanguageStats(repos as Repository[]);
  // console.dir(aggregatedStats, { depth: null });
  generateStats(aggregatedStats, "image/image.svg").then(() => {
    console.log("SVG generated successfully.");
  });
});

// generateStats(SAMPLE_STATS, "image/image.svg").then(() => {
//   console.log("SVG generated successfully.");
// });
