YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "AppComponent",
        "AppModule",
        "BooleanPipe",
        "Breast",
        "BreastNormalizedAssay",
        "BreastPathology",
        "CapitalizePipe",
        "CascadeSelectComponent",
        "ChoicePipe",
        "ClinicalEncounter",
        "CollectionActivatedRouteStub",
        "CollectionComponent",
        "CollectionComponentSpec",
        "CollectionItemComponent",
        "CollectionListPage",
        "CollectionListSpec",
        "CollectionModule",
        "CollectionRouterStub",
        "CollectionSubectServiceStub",
        "CollectionsActivatedRouteStub",
        "CollectionsComponent",
        "CollectionsComponentSpec",
        "CollectionsModule",
        "CollectionsResource",
        "CollectionsService",
        "CollectionsServiceStub",
        "Color",
        "ColorBarDirective",
        "CommonModule",
        "ConfigurationService",
        "ConfigurationServiceSpec",
        "ControlsModule",
        "CorrelationComponent",
        "DateHelper",
        "DateHelperSpec",
        "Encounter",
        "ErrorComponent",
        "ErrorHandler",
        "FileService",
        "FileServiceSpec",
        "Findable",
        "FloorPipe",
        "HomeComponent",
        "IamgeSequenceService",
        "Image",
        "ImageComponent",
        "ImageModule",
        "ImageSequence",
        "ImageSequenceServiceSpec",
        "ImageSequenceSessionServiceStub",
        "ImageSequenceSpec",
        "ImageStore",
        "LabelMap",
        "Modeling",
        "ModelingComponent",
        "ModelingModule",
        "ModelingProtocolComponent",
        "ModelingResult",
        "ModelingResults",
        "ModelingSourceComponent",
        "MomentPipe",
        "ObjectHelper",
        "Page",
        "PageComponent",
        "PageModule",
        "PapayaService",
        "ParameterResult",
        "Pathology",
        "PlayerComponent",
        "ProjectItemComponent",
        "ProjectListPage",
        "ProjectListSpec",
        "ProjectsComponent",
        "ProjectsComponentSpec",
        "ProjectsModule",
        "ProjectsResource",
        "ProjectsService",
        "ProjectsServiceStub",
        "PropertyTableComponent",
        "ProtocolResource",
        "ProtocolService",
        "RCB",
        "REST",
        "RESTSpec",
        "Registration",
        "RegistrationSpec",
        "RestResource",
        "Roman",
        "RomanSpec",
        "Sarcoma",
        "Scan",
        "ScanSpec",
        "ScatterPlotDirective",
        "Session",
        "SessionActivatedRouteStub",
        "SessionComponent",
        "SessionComponentSpec",
        "SessionDetailResource",
        "SessionDetailResourceStub",
        "SessionModule",
        "SessionService",
        "SessionServiceSpec",
        "SessionServiceStub",
        "SessionSpec",
        "SessionSubjectResourceStub",
        "SessionTumorExtent",
        "SessiondRouterStub",
        "SliderDirective",
        "SparkLineDirective",
        "StringHelper",
        "StringHelperSpec",
        "Subject",
        "SubjectActivatedRouteStub",
        "SubjectChangeDetectorRefStub",
        "SubjectComponent",
        "SubjectComponentSpec",
        "SubjectModule",
        "SubjectResource",
        "SubjectResourceStub",
        "SubjectService",
        "SubjectServiceSpec",
        "SubjectServiceStub",
        "SubjectSpec",
        "SubjectdRouterStub",
        "Symbol",
        "TNM",
        "Table",
        "TimeLineDirective",
        "TimeSeries",
        "Treatment",
        "UnderscorePipe",
        "UnspecifiedPipe",
        "VisualizationModule",
        "Volume",
        "VolumeComponent",
        "VolumeDetailPage",
        "VolumeImageSequenceServiceStub",
        "VolumeModule",
        "VolumeService",
        "VolumeServiceSpec",
        "VolumeSpec",
        "XNAT",
        "XNATSpec"
    ],
    "modules": [
        "clinical",
        "collection",
        "collections",
        "common",
        "configuration",
        "controls",
        "data",
        "date",
        "error",
        "file",
        "home",
        "image",
        "imageSequence",
        "main",
        "modeling",
        "object",
        "page",
        "project",
        "projects",
        "protocol",
        "rest",
        "roman",
        "session",
        "string",
        "subject",
        "testing",
        "visualization",
        "volume"
    ],
    "allModules": [
        {
            "displayName": "clinical",
            "name": "clinical",
            "description": "The static clinical utilities."
        },
        {
            "displayName": "collection",
            "name": "collection",
            "description": "This Collection Detail module exports the following directives:\n{{#crossLink \"CollectionComponent\"}}{{/crossLink}}"
        },
        {
            "displayName": "collections",
            "name": "collections",
            "description": "This Collections List module exports the following directives:\n{{#crossLink \"CollectionsComponent\"}}{{/crossLink}}"
        },
        {
            "displayName": "common",
            "name": "common",
            "description": "The common module exports the following directives:\n{{#crossLink \"PropertyTableComponent\"}}{{/crossLink}}"
        },
        {
            "displayName": "configuration",
            "name": "configuration",
            "description": "The application configuration module."
        },
        {
            "displayName": "controls",
            "name": "controls",
            "description": "The controls module exports the following directives:\n{{#crossLink \"SliderDirective\"}}{{/crossLink}}\n{{#crossLink \"PlayerComponent\"}}{{/crossLink}}\n{{#crossLink \"CascadeSelectComponent\"}}{{/crossLink}}"
        },
        {
            "displayName": "data",
            "name": "data",
            "description": "The {{#crossLink \"DateHelper\"}}{{/crossLink}} validator."
        },
        {
            "displayName": "date",
            "name": "date",
            "description": "The date utilities."
        },
        {
            "displayName": "error",
            "name": "error",
            "description": "The error handler module."
        },
        {
            "displayName": "file",
            "name": "file",
            "description": "The {{#crossLink \"FileService\"}}{{/crossLink}} validator."
        },
        {
            "displayName": "home",
            "name": "home",
            "description": "The home button component."
        },
        {
            "displayName": "image",
            "name": "image",
            "description": "This image module is responsible for image load, parsing\nand display. The module exports the following directives:\n{{#crossLink \"ImageComponent\"}}{{/crossLink}}"
        },
        {
            "displayName": "imageSequence",
            "name": "imageSequence",
            "description": "The test mock for a `SessionService`."
        },
        {
            "displayName": "main",
            "name": "main",
            "description": "This application entry module declares the top-level\nmain {{#crossLink \"AppComponent\"}}{{/crossLink}} and\nprovides the following shared services:\n* the REST resource providers\n* {{#crossLink \"ConfigurationService\"}}{{/crossLink}}\n* {{#crossLink \"SubjectService\"}}{{/crossLink}}\n* {{#crossLink \"SessionService\"}}{{/crossLink}}\n* {{#crossLink \"PapayaService\"}}{{/crossLink}}\n\nThese shared services are singletons and should not be\nredundantly provided by the feature submodules.\n\nThe page-level application feature modules are lazy-loaded.\nThese include the following:\n* {{#crossLink \"ProjectsModule\"}}{{/crossLink}}\n* {{#crossLink \"CollectionsModule\"}}{{/crossLink}}\n* {{#crossLink \"CollectionModule\"}}{{/crossLink}}\n* {{#crossLink \"SubjectModule\"}}{{/crossLink}}\n* {{#crossLink \"SessionModule\"}}{{/crossLink}}\n* {{#crossLink \"VolumeModule\"}}{{/crossLink}}"
        },
        {
            "displayName": "modeling",
            "name": "modeling",
            "description": "The modeling module exports the following directives:\n{{#crossLink \"ModelingComponent\"}}{{/crossLink}}"
        },
        {
            "displayName": "object",
            "name": "object",
            "description": "Object utilities."
        },
        {
            "displayName": "page",
            "name": "page",
            "description": "The page module exports the following directives:\n* {{#crossLink \"HomeComponent\"}}{{/crossLink}}\n* {{#crossLink \"ErrorComponent\"}}{{/crossLink}}"
        },
        {
            "displayName": "project",
            "name": "project",
            "description": "The project REST resource."
        },
        {
            "displayName": "projects",
            "name": "projects",
            "description": "The Projects List module."
        },
        {
            "displayName": "protocol",
            "name": "protocol",
            "description": "The protocol REST resource."
        },
        {
            "displayName": "rest",
            "name": "rest",
            "description": "The REST utilities."
        },
        {
            "displayName": "roman",
            "name": "roman",
            "description": "Roman numeral conversion utilities."
        },
        {
            "displayName": "session",
            "name": "session",
            "description": "This Session Detail module exports the\n{{#crossLink \"SessionComponent\"}}{{/crossLink}}\ndirective."
        },
        {
            "displayName": "string",
            "name": "string",
            "description": "String utilities."
        },
        {
            "displayName": "subject",
            "name": "subject",
            "description": "This Subject Detail module exports the\n{{#crossLink \"SubjectComponent\"}}{{/crossLink}}\ndirective."
        },
        {
            "displayName": "testing",
            "name": "testing",
            "description": "The WebElement extension for finding subelements."
        },
        {
            "displayName": "visualization",
            "name": "visualization",
            "description": "This D3 facade module exports the following directives:\n{{#crossLink \"ScatterPlotDirective\"}}{{/crossLink}}\n{{#crossLink \"SparkLineDirective\"}}{{/crossLink}}\n{{#crossLink \"ColorBarDirective\"}}{{/crossLink}}"
        },
        {
            "displayName": "volume",
            "name": "volume",
            "description": "This Volume Detail module exports the\n{{#crossLink \"VolumeComponent\"}}{{/crossLink}}\ndirective."
        }
    ],
    "elements": []
} };
});