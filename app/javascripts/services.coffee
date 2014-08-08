define(
  ['angular', 'chart', 'dateline', 'helpers', 'image',
   'intensity', 'modeling', 'resources', 'router'],
  (ng) ->
    ng.module 'qiprofile.services', [
      'qiprofile.helpers',
      'qiprofile.image', 'qiprofile.intensity', 'qiprofile.modeling',
      'qiprofile.resources', 'qiprofile.router'
    ]
)
