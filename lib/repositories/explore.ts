//lib/repositories/explore.ts
//exploreページ用のfetch関数（データ取得関数）や表示整形関数をまとめるところ

import { findPublishedWorksForExplore } from "@/lib/repositories/work";
import { findPublishedGeneratedForExplore } from "@/lib/repositories/generated-content";
import {
  toExploreGeneratedCardItem,
  toExploreWorkCardItem,
} from "@/lib/mappers/card-item";

//exploreページの記事データを取得し、表示版に整形する関数
export async function findExploreWorkSections(q: string) {
  const [latestWorks, popularWorks] = await Promise.all([
    findPublishedWorksForExplore({
      q,
      sort: "latest",
    }),
    findPublishedWorksForExplore({
      q,
      sort: "likes",
    }),
  ]);

  return {
    latestItems: latestWorks.map((work) => toExploreWorkCardItem({ work })),
    popularItems: popularWorks.map((work) => toExploreWorkCardItem({ work })),
  };
}
//exploreページの作品データを取得し、表示版に整形する関数
export async function findExploreGeneratedSections(q: string) {
  const [latestGeneratedContents, popularGeneratedContents] = await Promise.all([
    findPublishedGeneratedForExplore({
      q,
      sort: "latest",
    }),
    findPublishedGeneratedForExplore({
      q,
      sort: "likes",
    }),
  ]);

  return {
    latestItems: latestGeneratedContents.map((generatedContent) =>
      toExploreGeneratedCardItem({ generatedContent })
    ),
    popularItems: popularGeneratedContents.map((generatedContent) =>
      toExploreGeneratedCardItem({ generatedContent })
    ),
  };
}