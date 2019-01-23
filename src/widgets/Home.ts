import WidgetBase from "@dojo/framework/widget-core/WidgetBase";
import { v, w } from "@dojo/framework/widget-core/d";
import { createFetcher, createUpdater } from "@dojo/widgets/grid/utils";
import Grid from "@dojo/widgets/grid";

import * as css from "./styles/Home.m.css";

export default class Home extends WidgetBase {
  private _fetcher: any;
  private _updater: any;
  private _columnConfig = [
    {
      id: "id",
      title: "ID"
    },
    {
      id: "first_name",
      title: "First Name",
      editable: true,
      sortable: true
    },
    {
      id: "last_name",
      title: "Last Name",
      editable: true,
      sortable: true
    },
    {
      id: "job",
      title: "Job Title",
      editable: true,
      filterable: true
    },
    {
      id: "gender",
      title: "Gender",
      editable: true
    },
    {
      id: "animal",
      title: "Pet",
      editable: true,
      filterable: true
    }
  ];

  async onAttach() {
    console.log("onAttach called...");
    const response = await fetch("http://localhost:1234/data");
    const json = await response.json();
    this._fetcher = createFetcher(json);
    this._updater = createUpdater(json);
    this.invalidate();
  }

  protected render() {
    return v("div", { classes: [css.root] }, [
      v("h1", ["Grid Data"]),
      this._fetcher ?
      w(Grid, {
        columnConfig: this._columnConfig,
        fetcher: this._fetcher,
        updater: this._updater,
        height: 600
      }) : null
    ]);
  }
}
