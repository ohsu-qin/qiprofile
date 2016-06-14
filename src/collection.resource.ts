import { ResourceParams } from 'ng2-resource-rest';

import { RestResource } from './rest.resource.ts';

@ResourceParams({
    path: '/imaging-collection/{id}'
})

export class CollectionResource extends RestResource {}
