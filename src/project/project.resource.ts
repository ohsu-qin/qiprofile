import { ResourceParams } from 'ng2-resource-rest';

import { RestResource } from '../rest/rest.resource.ts';

@ResourceParams({
    path: '/project/{id}'
})

/**
 * The project REST resource.
 *
 * @class ProjectResource
 * @extends RestResource
 */
export class ProjectResource extends RestResource {}
