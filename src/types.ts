type QueryParams = Record<string, string | number | number[]>

type RequestOptions = 
| { method: "get", url: string }
| { method: "post", url: string, payload: Record<string, string | number | number[]> }

type SpaceInfo = {
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

type ProjectInfo = {
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

type AddIssueParams = {
  projectId: number,
  issueTypeId: number,
  priorityId: number,
  parentIssueId?: number,
  description?: string,
  startDate?: string,
  dueDate?: string,
}

type AddCommentParams = {
  "notifiedUserId[]": number[],
  "attachmentId[]": number[],
}

type AddCommentResponse = {
  id: number,
  projectId: number,
  issueId: number,
  content: string,
  created: string,
  updated: string,
}

type ProjectCategory = {
  id: number,
  projectId: number,
  name: string,
  displayOrder: number,
}

type IssueType = {
  id: number,
  projectId: number,
  name: string,
  displayOrder: number,
  color: string
  templateSummary: string,
  tempalteDescription: string,
}

type Priority = {
  id: number,
  name: string,
}

type Issue = {
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

type Status = {
  id: number,
  projectId: number,
  name: string,
  displayOrder: number,
  color: string
}



