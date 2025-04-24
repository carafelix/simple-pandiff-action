import * as core from '@actions/core'
import github from '@actions/github'
import pandiff from 'pandiff'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run() {
  try {
    const token = core.getInput('repo-token')
    const octokit = github.getOctokit(token)
    const context = github.context

    if (!context.payload.pull_request) {
      core.setFailed('This action only runs on pull_request events.')
      return
    }

    const { owner, repo } = context.repo
    const pull_number = context.payload.pull_request.number
    const baseBranch = context.payload.pull_request.base.ref

    core.info(
      `🔍 Fetching changed files for PR #${pull_number} against ${baseBranch}`
    )

    const prFiles = await octokit.paginate(
      octokit.rest.pulls.listFiles,
      { owner, repo, pull_number, per_page: 100 },
      (response) => response.data
    )

    const pandiffedFiles = []
    for (const file of prFiles) {
      try {
        const prRawText = await (await fetch(file.raw_url)).text()
        const urlBase =
          file.raw_url.split('/raw/')[0] +
          '/raw/' +
          baseBranch +
          '/' +
          file.filename
        // TODO- add previous filename check
        const baseRawText = await (await fetch(urlBase)).text()
        const diff = pandiff(baseRawText, prRawText, { to: 'html' })
        pandiffedFiles.push({ file: file.filename, diff })
      } catch (error) {
        core.error(`File ${file.filename} fail. Skipped. Error: ${error}`)
      }
    }
    core.setOutput('diffs', pandiffedFiles)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
run()