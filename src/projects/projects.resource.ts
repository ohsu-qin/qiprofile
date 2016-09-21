import { ResourceParams } from 'ng2-resource-rest';

import { RestResource } from '../rest/rest.resource.ts';

@ResourceParams({
    path: '/project/{id}'
})

/**
 * The project REST resource.
 *
 * @module project
 * @class ProjectsResource
 * @extends RestResource
 */
export class ProjectsResource extends RestResource { }
