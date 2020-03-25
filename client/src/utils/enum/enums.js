export const OptionTypes = Object.freeze({
  NUMBER_FIELD: 'number-field',
  TOGGLE: 'toggle',
  MAP: 'map',
  DATE_PICKER: 'date-picker',
  FIELD: 'field',
  PHOTOGRAPH: 'photograph',
  EXPANSION_PANEL: 'expansion-panel',
  TREE_VIEW: 'tree-view',
  SLIDER: 'slider',
  AUTOCOMPLETE: 'autocomplete'
});

export const ButtonTypes = Object.freeze({
  STEPPER: 'stepper',
  EXECUTER: 'executer'
});

export const PhotosOf = Object.freeze({
  FIND: 'find',
  FIND_SITE: 'find-site'
});

export const TreeViewTypes = Object.freeze({
  MATERIAL: 'material',
  TYPE: 'type',
  ERAS: 'eras'
});

export const ButtonActions = Object.freeze({
  CHANGE_CURRENT_FIND_INDEX: 'change-current-find-index',
  SET_REPORT_ID: 'set-report-id',
  SEND_FIND_NOTIFICATION: 'send-find-notification',
  SEND_FIND_IMAGES: 'send-find-images',
  SEND_FIND_SITE_IMAGES: 'send-find-site-images'
});

export const RouterPaths = Object.freeze({
  HOME_PAGE: '/',
  REPORT_PAGE: '/report',
  LOGIN_PAGE: '/login',
  SIGNUP_PAGE: '/signup',
  MY_FINDS_PAGE: '/myfinds',
  FIND_PAGE: '/find',
  MY_FINDS_REPORT_OVERVIEW_PAGE: '/myfinds-report-overview',
  MORE_PAGE: '/more',
  NEARBY_PAGE: '/nearby',
  LEGALITY_CHECKER_PAGE: '/amisafe',
});

export const QuestionDependencies = Object.freeze({
  LOCATION: 'location',
  FIND_SITE_PHOTO: 'find-site-photo',
  FIND_PHOTO: 'find-photo'
});

export const FacetFilters = Object.freeze({
  TITLE: 'title',
  TYPE: 'type',
  MATERIAL: 'main_material',
  MUNICIPALITY: 'municipality',
  PERIOD: 'period',
  PROVINCE: 'province',
});

export const MapMode = Object.freeze({
  HEATMAP: 'heat-map',
  CLUSTURED_MAP: 'clustured-map'
});

export const FhaMapLayers = Object.freeze({
  ARCHEOLOGICAL_PLACES_AREAS: 'arkeologiset_kohteet_alue',
  ARCHEOLOGICAL_PLACES_POINT: 'Arkeologiset_kohteet_piste',
  WORLD_HERITAGE_SITE_AREAS: 'maailmanperinto_alue',
  WORLD_HERITAGE_SITE_POINT: 'maailmanperinto_piste',
  ARCHITECTURAL_HERITAGE_AREAS: 'rakennusperinto_alue',
  ARCHITECTURAL_HERITAGE_POINT: 'rakennusperinto_piste',
  ARCHEOLOGICAL_SUBPLACES_POINT: 'arkeologisten_kohteiden_alakohteet_piste',
  RKY_AREAS: 'rky_alue',
  RKY_POINTS: 'rky_piste',
  RKY_LINES: 'rky_viiva',
  ARCHEOLOGICAL_FINDS: 'arkeologiset_loydot',
});

export const Colors = Object.freeze({
  PINK: '#e91e63',
  PURPLE: '#9c27b0',
  DEEP_PURPLE: '#673ab7',
  BLUE: '#2196f3',
  CYAN: '#00bcd4',
  TEAL: '#009688',
  GREEN: '#4caf50',
  LIME: '#cddc39',
  YELLOW: '#ffeb3b',
  ORANGE: '#ff9800',
  BROWN: '#795548',
  GREY: '#e0e0e0',
  DARK_YELLOW: '#ffc107',
  DARK_LIME: '#eeff41',
  DARK_GREEN: '#43a047',
  DARK_RED: '#dd2c00',
  INDIGO: '#3f51b5'
});

export const ReportStatuses = Object.freeze({
  DRAFT: 'draft',
  AWAIT_REVIEW: 'await_review',
  IN_REVIEW: 'in_review',
  VALIDATED: 'validated',
  REJECTED: 'rejected',
  PENDING_USER: 'peding_user'
});

export const ReportSteps = Object.freeze({
  LOCATION: 1,
  MATERIAL: 7,
  TYPE: 8,
  PERIOD: 9
});

export const SmartHelpers = Object.freeze({
  NEARBY_HELPER: 'nearby',
  MATERIAL_HELPER: 'material',
  TYPE_HELPER: 'type',
  PERIOD_HELPER: 'period'
});

export const SmartHelperMode = Object.freeze({
  NEARBY: 'nearby',
  OVERALL: 'overall'
});

export const ReportingIDs = Object.freeze({
  PREFIX_REPORT: 'sam_r_',
  PREFIX_FIND: 'sam_f_',
  PREFIX_FIND_SITE: 'sam_fs_',
  PREFIX_FIND_IMAGE: 'sam_fimg_',
  PREFIX_FIND_SITE_IMAGE: 'sam_fsimg_'
});

export const MyFindsPageFilter = Object.freeze({
  DATE: 'date',
  MUNICIPALITY: 'municipality'
});

export const MyFindsPageViews = Object.freeze({
  TABLE: 'table',
  MAP: 'map'
});