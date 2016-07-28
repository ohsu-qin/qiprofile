export class SubjectService {
  /**
   * @method getSubjects
   * @param project {string} the project name
   * @param collection {string} the collection name
   * @return {Observable} the REST subject objects
   */
  getSubjects(project: string, collection: string): Observable<Object[]> {
    // The selection query parameters.
    let params: string = RestService.where(
      {project: project, collection: collection}
    );
    // Fetch the subjects.
    let subjects: Observable<Object[]> = this.resource.find(params);

    // Return the extended subjects.
    return subjects.map(fetched => fetched.map(Subject.extend));
  }
}
