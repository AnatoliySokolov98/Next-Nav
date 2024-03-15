import { isAbsolute, normalize, join, resolve } from "path";
import { stat } from "fs/promises";
import { workspace } from "vscode";

/**
 * Takes path and makes it absolute if needed.
 *
 * @param dirPath Directory we are looking at.
 * @return Absolute path if the working directory exists and empty string otherwise.
 */
export function makeAbsolutePath(dirPath: string): string {
  //Workspace doesn't exist at all
  if (!workspace.workspaceFolders) {
    console.error("No workspace folder found");
    return "";
  }
  const normalizedPath = normalize(dirPath);
  const workSpaceDir = workspace.workspaceFolders[0].uri.fsPath;
  if (isAbsolute(normalizedPath)) {
    return normalizedPath;
  }

  const fullPath = join(workSpaceDir, dirPath);
  return fullPath;
}

/**
 * Takes normalized absolute path and checks for this path being in our workspace.
 *
 * @param dirPath Normalized directory we are looking at.
 * @return Does the path exist in our workspace.
 */
export async function doesPathExist(dirPath: string): Promise<boolean> {
  //Workspace doesn't exist at all
  if (!workspace.workspaceFolders) {
    console.error("No workspace folder found");
    return false;
  }
  const workSpaceDir = workspace.workspaceFolders[0].uri.fsPath;
  try {
    //Absolute directory is not in the workspace
    if (!isSubdirectory(dirPath)) {
      return false;
    }
    //Path info
    const info = await stat(dirPath);
    return info.isDirectory();
  } catch (error) {
    console.error(error);
    return false;
  }
}

/**
 * Takes normalized absolute path and checks for this path being in our workspace.
 *
 * @param absolutePath Normalized absolute path we are looking at.
 * @return Does the path exist in our workspace.
 */
export function isSubdirectory(absolutePath: string): boolean {
  const workSpaceDir = workspace.workspaceFolders![0].uri.fsPath;
  const parentNode = absolutePath.toLowerCase();
  return parentNode.startsWith(workSpaceDir.toLowerCase());
}
