import {
  AddCommentParams,
  AddCommentResponse,
  AddIssueParams,
  Issue,
  PostAttachmentResponse,
  Priority,
  ProjectCategory,
  ProjectInfo,
  QueryParams,
  SpaceInfo,
  RequestOptions,
  Status,
  IssueType,
  LinkSharedFileToIssueResponse,
} from "./types"

const PROPERTY_KEYS: Record<string, string> = {
  "API_KEY": "BACKLOG_API_KEY",
  "ORG_DOMAIN": "BACKLOG_ORG_DOMAIN",
}

function request_(option: RequestOptions): GoogleAppsScript.URL_Fetch.HTTPResponse {
  if (!["get", "post"].includes(option.method)) {
    throw new Error(`${option.method} is not allowed`);
  }
  const up = PropertiesService.getUserProperties()
  const keys = up.getKeys()
  if (!keys.includes(PROPERTY_KEYS.API_KEY) || !keys.includes(PROPERTY_KEYS.ORG_DOMAIN)) {
    throw new Error("APIトークンまたは組織のドメインが設定されていません。")
  }

  const _: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: option.method,
    muteHttpExceptions: true,
  }
  if (option.method === "post") {
    _.payload = option.payload
    if (option.headers) {
      _.headers = option.headers
    }
  }
  return UrlFetchApp.fetch(option.url, _)
}

function buildRequestUrl_(path: string, params: QueryParams): string {
  const up = PropertiesService.getUserProperties()
  const apiKey = up.getProperty(PROPERTY_KEYS.API_KEY) ?? ""
  const orgDomain = up.getProperty(PROPERTY_KEYS.ORG_DOMAIN) ?? ""
  const queryParams: string[] = [
    `${encodeURIComponent("apiKey")}=${encodeURIComponent(apiKey)}`
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
  const baseUrl = `https://${orgDomain}/api/v2`;
  return `${baseUrl}${path}?${queryParams.join("&")}`
}

/**
 * https://developer.nulab.com/ja/docs/backlog/auth/#api-key
  * @param {string} apiToken APIトークン
  * @param {string} orgDomain Backlog組織のドメイン(xx.backlog.com / xx.backlog.jp)
  */
export function setCredential(apiToken: string, orgDomain: string) {
  const up = PropertiesService.getUserProperties()
  up.setProperty(PROPERTY_KEYS.API_KEY, apiToken)
  up.setProperty(PROPERTY_KEYS.ORG_DOMAIN, orgDomain)
}


/**
   * スペース情報を取得する
   * https://developer.nulab.com/ja/docs/backlog/api/2/get-space/
   */
export function getSpace(): SpaceInfo {
  const res = request_({
    method: "get",
    url: buildRequestUrl_("/space", {}),
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
export function getPriorities(): Priority[] {
  const res = request_({
    method: "get",
    url: buildRequestUrl_("/priorities", {}),
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
export function getIssues(projectIds: number[] = []): Issue[] {
  const res = request_({
    method: "get",
    url: buildRequestUrl_("/issues", {
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
* 1件の課題の詳細を取得する
* https://developer.nulab.com/ja/docs/backlog/api/2/get-issue/
* @param {string} projectIdOrKey プロジェクトIDまたはキー
*
* */
export function getIssue(projectIdOrKey: string = ""): Issue {
  const res = request_({
    method: "get",
    url: buildRequestUrl_(`/issues/${projectIdOrKey}`, {}),
  })
  if (res.getResponseCode() !== 200) {
    throw new Error(`Failed to get issue: ${res.getContentText()}`);
  }
  const json: Issue = JSON.parse(res.getContentText());
  return json
}


/**
   * 単一のプロジェクト情報を取得する
   * https://developer.nulab.com/ja/docs/backlog/api/2/get-project/
   * @param {string} projectIdOrKey プロジェクトIDまたはキー
   */
export function getProject(projectIdOrKey: string = ""): ProjectInfo {
  if (!projectIdOrKey) {
    throw new Error("projectIdOrKey is required");
  }
  const res = request_({
    method: "get",
    url: buildRequestUrl_(`/projects/${projectIdOrKey}`, {}),
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
export function getProjectCategories(projectIdOrKey: string = ""): ProjectCategory[] {
  if (!projectIdOrKey) {
    throw new Error("projectIdOrKey is required");
  }
  const res = request_({
    method: "get",
    url: buildRequestUrl_(`/projects/${projectIdOrKey}/categories`, {}),
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
export function getProjectIssueTypes(projectIdOrKey: string = ""): IssueType[] {
  if (!projectIdOrKey) {
    throw new Error("projectIdOrKey is required");
  }
  const res = request_({
    method: "get",
    url: buildRequestUrl_(`/projects/${projectIdOrKey}/issueTypes`, {}),
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
   * @param {Object} params その他のリクエストパラメータ
   */
export function addIssue(summary: string = "", params: AddIssueParams) {
  const res = request_({
    method: "post",
    url: buildRequestUrl_("/issues", params),
    payload: {
      summary
    },
  })
  if (res.getResponseCode() !== 201) {
    throw new Error(`Failed to add issue: ${res.getContentText()}`);
  }
  // TODO: add issue type definition
  const json = JSON.parse(res.getContentText());
  return json
}

/**
   * コメントを追加する
   * https://developer.nulab.com/ja/docs/backlog/api/2/add-comment/
   * @param {issueIdOrKey} issueIdOrKey 課題IDまたはキー
   * @param {string} content コメントの本文
   * @param {object} params その他のリクエストパラメータ
   */
export function addComment(issueIdOrKey: string = "", content: string = "", params: AddCommentParams): AddCommentResponse {
  if (!issueIdOrKey) {
    throw new Error("issueIdOrKey is required");
  }
  const res = request_({
    method: "post",
    url: buildRequestUrl_(`/issues/${issueIdOrKey}/comments`, params),
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
export function getProjectStatus(projectIdOrKey: string = ""): Status[] {
  if (!projectIdOrKey) {
    throw new Error("projectIdOrKey is required");
  }
  const res = request_({
    method: "get",
    url: buildRequestUrl_(`/projects/${projectIdOrKey}/statuses`, {}),
  })
  if (res.getResponseCode() !== 200) {
    throw new Error(`Failed to get project issue types: ${res.getContentText()}`);
  }
  const json: Status[] = JSON.parse(res.getContentText());
  return json
}

/**
  * 添付ファイルの送信
  * https://developer.nulab.com/ja/docs/backlog/api/2/post-attachment-file/
  * @param {GoogleAppsScript.Drive.File} file DriveApp.File形式
  *
  */
export function postAttachment(file: GoogleAppsScript.Drive.File): PostAttachmentResponse {
  const boundary = Utilities.getUuid()
  const lineBreak = "\r\n"
  const safeFileName = file.getName().replace(/[\\"\r\n]/g, c => `\\${c}`)

  const multipartBody = `--${boundary}${lineBreak}`
    + `Content-Disposition: form-data; name="file"; filename="${safeFileName}"${lineBreak}`
    + `Content-Type: ${file.getBlob().getContentType()}${lineBreak}${lineBreak}`

  const payload = Utilities.newBlob(multipartBody).getBytes()
  .concat(file.getBlob().getBytes())
  .concat(Utilities.newBlob(`${lineBreak}--${boundary}--`).getBytes())

  const res = request_({
    method: "post",
    url: buildRequestUrl_(`/space/attachment`, {}),
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
    },
    payload: payload,
  })
  if (res.getResponseCode() !== 200) {
    throw new Error(`Failed to post attachment: ${res.getContentText()}`)
  }
  const json: PostAttachmentResponse = JSON.parse(res.getContentText())
  return json
}


/**
 * 課題にファイルをリンクする
 * https://developer.nulab.com/ja/docs/backlog/api/2/link-shared-files-to-issue/
* @param {string} issueIdOrKey 課題IDまたはキー
 * @param [fileId=[]] 共有ファイルのID
 */
export function linkSharedFileToIssue(issueIdOrKey: string = "", fileId: string[] = []) {
  const res = request_({
    method: "post",
    url: buildRequestUrl_(`/issues/${issueIdOrKey}/sharedFiles`, {}),
    payload: {
      fileId,
    },
  })
  if (res.getResponseCode() !== 200) {
    throw new Error(`Failed to post attachment: ${res.getContentText()}`)
  }
  const json: LinkSharedFileToIssueResponse = JSON.parse(res.getContentText())
  return json
}

