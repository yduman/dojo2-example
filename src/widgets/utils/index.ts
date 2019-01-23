import { FetcherOptions } from "@dojo/widgets/grid/interfaces";
import { sorter, filterer } from "@dojo/widgets/grid/utils";

export const createRestFetcher = (url: string): any => {
  const fetchRequest = fetch(url, {
    headers: { "Content-Type": "application/json" }
  });

  let data: any[];

  return async (page: number, pageSize: number, options: FetcherOptions) => {
    if (!data) {
      const response = await fetchRequest;
      const json = await response.json();
      data = json.data;
    }

    const offset = (page - 1) * pageSize;
    const temp = sorter(filterer(data, options), options);

    return {
      data: temp.slice(offset, offset + pageSize),
      meta: { total: temp.length }
    };
  };
};
