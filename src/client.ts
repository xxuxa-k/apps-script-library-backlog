import {
  AddCommentParams,
  AddCommentResponse,
  AddIssueParams,
  Issue,
  IssueType,
  Status,
  Priority,
  ProjectCategory,
  ProjectInfo,
  QueryParams,
  RequestOptions,
  SpaceInfo,
} from "./types";


/**
  * @param {string} apiKey API key
  * @param {string} orgName Organization name
  * @return {Client} BacklogClient object
  */
function createClient(apiKey: string, orgName: string) {
  return new Client(apiKey, orgName);
}

class Client {
  #apiKey: string;
  #baseUrl: string

  constructor(apiKey: string, orgName: string) {
    this.#apiKey = apiKey;
    this.#baseUrl = `https://${orgName}.backlog.com/api/v2`;
  }

  #request(option: RequestOptions) {
    if (!["get", "post"].includes(option.method)) {
      throw new Error(`${option.method} is not allowed`);
    }

    const _: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
      method: option.method,
      muteHttpExceptions: true,
    }
    if (option.method === "post") {
      _.payload = option.payload
    }
    return UrlFetchApp.fetch(option.url, _)
  }

  #buildRequestUrl(path: string, params: QueryParams): string {
    const queryParams: string[] = [
      `${encodeURIComponent("apiKey")}=${encodeURIComponent(this.#apiKey)}`
    ]
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        for (const v of value) {
          queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`)
        }
      } else {
        queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      }
    }
    return `${this.#baseUrl}${path}?${queryParams.join("&")}`
  }

  /**
   * スペース情報を取得する
   * https://developer.nulab.com/ja/docs/backlog/api/2/get-space/
   */
  getSpace(): SpaceInfo {
    const res = this.#request({
      method: "get",
      url: this.#buildRequestUrl("/space", {}),
    })
    if (res.getResponseCode() !== 200) {
      throw new Error(`Failed to get space: ${res.getContentText()}`);
    }
    const json: SpaceInfo = JSON.parse(res.getContentText());
    return json
  }

  /**
   * 優先度一覧を取得する
   * https://developer.nulab.com/ja/docs/backlog/api/2/get-priority-list/
   */
  getPriorities(): Priority[] {
    const res = this.#request({
      method: "get",
      url: this.#buildRequestUrl("/priorities", {}),
    })
    if (res.getResponseCode() !== 200) {
      throw new Error(`Failed to get priorities: ${res.getContentText()}`);
    }
    const json: Priority[] = JSON.parse(res.getContentText());
    return json
  }

  /**
   * 1件以上のプロジェクトに紐づく課題の詳細を取得する
   * https://developer.nulab.com/ja/docs/backlog/api/2/get-issue/
   * @param {number[]} projectIds プロジェクトIDの配列
   */
  getIssues(projectIds: number[] = []): Issue[] {
    const res = this.#request({
      method: "get",
      url: this.#buildRequestUrl("/issues", {
        "projectId[]": projectIds,
      }),
    })
    if (res.getResponseCode() !== 200) {
      throw new Error(`Failed to get issues: ${res.getContentText()}`);
    }
    const json: Issue[] = JSON.parse(res.getContentText());
    return json
  }

  /**
   * 単一のプロジェクト情報を取得する
   * https://developer.nulab.com/ja/docs/backlog/api/2/get-project/
   * @param {string} projectIdOrKey プロジェクトIDまたはキー
   */
  getProject(projectIdOrKey: string = ""): ProjectInfo {
    if (!projectIdOrKey) {
      throw new Error("projectIdOrKey is required");
    }
    const res = this.#request({
      method: "get",
      url: this.#buildRequestUrl(`/projects/${projectIdOrKey}`, {}),
    })
    if (res.getResponseCode() !== 200) {
      throw new Error(`Failed to get project: ${res.getContentText()}`);
    }
    const json: ProjectInfo = JSON.parse(res.getContentText());
    return json
  }

  /**
   * プロジェクトのカテゴリ一覧を取得する
   * https://developer.nulab.com/ja/docs/backlog/api/2/get-category-list/
   * @param {string} projectIdOrKey プロジェクトIDまたはキー
   */
  getProjectCategories(projectIdOrKey: string = ""): ProjectCategory[] {
    if (!projectIdOrKey) {
      throw new Error("projectIdOrKey is required");
    }
    const res = this.#request({
      method: "get",
      url: this.#buildRequestUrl(`/projects/${projectIdOrKey}/categories`, {}),
    })
    if (res.getResponseCode() !== 200) {
      throw new Error(`Failed to get project categories: ${res.getContentText()}`);
    }
    const json: ProjectCategory[] = JSON.parse(res.getContentText());
    return json
  }

  /**
   * プロジェクトの種別一覧を取得する
   * https://developer.nulab.com/ja/docs/backlog/api/2/get-issue-type-list/
   * @param {string} projectIdOrKey プロジェクトIDまたはキー
   */
  getProjectIssueTypes(projectIdOrKey: string = ""): IssueType[] {
    if (!projectIdOrKey) {
      throw new Error("projectIdOrKey is required");
    }
    const res = this.#request({
      method: "get",
      url: this.#buildRequestUrl(`/projects/${projectIdOrKey}/issueTypes`, {}),
    })
    if (res.getResponseCode() !== 200) {
      throw new Error(`Failed to get project issue types: ${res.getContentText()}`);
    }
    const json: IssueType[] = JSON.parse(res.getContentText());
    return json
  }

  /**
   * 課題を追加する
   * https://developer.nulab.com/ja/docs/backlog/api/2/add-issue/
   * @param {string} summary 課題の本文
   * @param {object} params その他のリクエストパラメータ
   */
  addIssue(summary: string = "", params: AddIssueParams): void {
    const res = this.#request({
      method: "post",
      url: this.#buildRequestUrl("/issues", params),
      payload: {
        summary
      },
    })
    if (res.getResponseCode() !== 201) {
      throw new Error(`Failed to add issue: ${res.getContentText()}`);
    }
  }

  /**
   * コメントを追加する
   * https://developer.nulab.com/ja/docs/backlog/api/2/add-comment/
   * @param {issueIdOrKey} issueIdOrKey 課題IDまたはキー
   * @param {string} content コメントの本文
   * @param {object} params その他のリクエストパラメータ
   */
  addComment(issueIdOrKey: string = "", content: string = "", params: AddCommentParams): AddCommentResponse {
    if (!issueIdOrKey) {
      throw new Error("issueIdOrKey is required");
    }
    const res = this.#request({
      method: "post",
      url: this.#buildRequestUrl(`/issues/${issueIdOrKey}/comments`, params),
      payload: {
        content,
      },
    })
    if (res.getResponseCode() !== 201) {
      throw new Error(`Failed to add comment: ${res.getContentText()}`);
    }
    const json: AddCommentResponse = JSON.parse(res.getContentText());
    return json
  }

  /**
   * プロジェクトの状態一覧を取得する
   * https://developer.nulab.com/ja/docs/backlog/api/2/get-status-list-of-project/
   * @param {string} projectIdOrKey プロジェクトIDまたはキー
   */
  getProjectStatus(projectIdOrKey: string = ""): Status[] {
    if (!projectIdOrKey) {
      throw new Error("projectIdOrKey is required");
    }
    const res = this.#request({
      method: "get",
      url: this.#buildRequestUrl(`/projects/${projectIdOrKey}/statuses`, {}),
    })
    if (res.getResponseCode() !== 200) {
      throw new Error(`Failed to get project issue types: ${res.getContentText()}`);
    }
    const json: Status[] = JSON.parse(res.getContentText());
    return json
  }
}

