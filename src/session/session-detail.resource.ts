import { ResourceParams } from 'ng2-resource-rest';

import { RestResource } from '../rest/rest.resource.ts';

@ResourceParams({
    path: '/session-detail/{id}'
})

/**
 * The session detail REST resource.
 *
 * @module session
 * @class SessionDetailResource
 * @extends RestResource
 */
export class SessionDetailResource extends RestResource {}
