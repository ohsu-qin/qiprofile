import { ResourceParams } from 'ng2-resource-rest';

import { RestResource } from '../rest/rest.resource.ts';

@ResourceParams({
    path: '/subject/{id}'
})

/**
 * The subject REST resource.
 *
 * @module subject
 * @class SubjectResource
 * @extends RestResource
 */
export class SubjectResource extends RestResource { }
