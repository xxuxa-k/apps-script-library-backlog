export type QueryParams = Record<string, string | number | number[]>

export type RequestOptionGet = {
  method: "get",
  url: string,
}
export type RequestOptionPost = {
  method: "post",
  url: string,
  headers?: Record<string, string>,
  payload: Record<
    string,
    string | string[] | number | number[] | GoogleAppsScript.Base.Blob
  > | string | number[],
}
export type RequestOptions = RequestOptionGet | RequestOptionPost

export type SpaceInfo = {
  spaceKey: string,
  name: string,
  ownerId: number,
  lang: string,
  timezone: string,
  reportSendTime: string,
  textFormattingRule: string,
  created: string,
  updated: string,
}

export type ProjectInfo = {
  id: number,
  projectKey: string,
  name: string,
  chartEnabled: boolean,
  useResolvedForChart: boolean
  projectLeaderCanEditProjectLeader: boolean,
  useWiki: boolean
  useFileSharing: boolean,
  useWikiTreeView: boolean,
  useOriginalImageSizeAtWiki: boolean,
  useSubversion: boolean,
  useGit: boolean,
  textFormattingRule: string,
  archived: boolean,
  displayOrder: number,
  useDevAttributes: boolean,
}

export type AddIssueParams = {
  projectId: number,
  issueTypeId: number,
  priorityId: number,
  parentIssueId?: number,
  description?: string,
  startDate?: string,
  dueDate?: string,
}

export type AddCommentParams = {
  "notifiedUserId[]": number[],
  "attachmentId[]": number[],
}

export type LinkSharedFileParams = {
  "fileId[]": number[],
}

export type AddCommentResponse = {
  id: number,
  projectId: number,
  issueId: number,
  content: string,
  created: string,
  updated: string,
}

export type PostAttachmentResponse = {
  id: number,
  name: string,
  size: number,
}

export type LinkSharedFileToIssueResponse = {
  id: number,
  name: string,
  size: number,
}

export type ProjectCategory = {
  id: number,
  projectId: number,
  name: string,
  displayOrder: number,
}

export type IssueType = {
  id: number,
  projectId: number,
  name: string,
  displayOrder: number,
  color: string
  templateSummary: string,
  tempalteDescription: string,
}

export type Priority = {
  id: number,
  name: string,
}

export type Issue = {
  id: number,
  projectId: number,
  issueKey: string,
  keyId: number,
  issueType: IssueType,
  summary: string,
  description: string,
  priority: Priority,
  status: Status,
}

export type Status = {
  id: number,
  projectId: number,
  name: string,
  displayOrder: number,
  color: string
}



