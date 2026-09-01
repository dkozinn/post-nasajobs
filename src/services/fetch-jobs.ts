interface JobDetail {
  LowGrade: string;
  HighGrade: string;
  JobSummary?: string;
}

interface JobOverview {
  PositionTitle: string;
  PositionID: string;
  PositionURI: string;
  JobGrade: { Code: string }[];
  OrganizationName: string;
  UserArea: {
    Details: JobDetail;
  };
}

interface USAJobsSearchResultItem {
  MatchedObjectDescriptor: JobOverview;
}

interface USAJobsResponse {
  SearchResult: {
    SearchResultCount: number;
    SearchResultItems: USAJobsSearchResultItem[];
  };
}

export async function fetchJobs(email: string, key: string): Promise<string> {
  if (!email || !key) {
    throw new Error('USAJobs API email or key is missing.');
  }

  const headers = {
    'Host': 'data.usajobs.gov',
    'User-Agent': email,
    'Authorization-Key': key,
  };
  const url = 'https://data.usajobs.gov/api/search?Organization=NN&DatePosted=1&Fields=Min&ResultsPerPage=50';
  const resp = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!resp.ok) {
    throw new Error(`USAJobs HTTP Error: status ${resp.status}`);
  }

  const data = (await resp.json()) as unknown as USAJobsResponse;
  const searchResult = data.SearchResult;
  if (!searchResult) {
    throw new Error('Invalid search result response structure from USAJobs.');
  }

  const items = searchResult.SearchResultItems || [];
  const itemCount = searchResult.SearchResultCount || 0;

  let result = '';
  for (let i = 0; i < itemCount; i++) {
    const item = items[i];
    if (!item) continue;
    const overview = item.MatchedObjectDescriptor;
    if (!overview) continue;
    const details = overview.UserArea?.Details;
    if (!details) continue;

    result += `# ${overview.PositionTitle}\n`;
    result += `#### [${overview.PositionID}](${overview.PositionURI})\n`;

    const gradeCode = overview.JobGrade?.[0]?.Code || '';
    result += `Grade: ${gradeCode}-${details.LowGrade}`;
    if (details.HighGrade > details.LowGrade) {
      result += `/${details.HighGrade}`;
    }
    result += '\n';
    result += `###### ${overview.OrganizationName}\n\n`;
    result += `${details.JobSummary || ''}\n`;
    result += '\n\n' + '-'.repeat(40) + '\n\n';
  }

  return result;
}
