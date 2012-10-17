FNMGroupSecurity
============

A FluxNode Mixin to provide Group Based User Security

## Attributes

The following Attributes are added to a FluxNode by this mixin

* FNMGroupSecurity_Settings
 * store
 * groupChannel
 * userChannel
 
## Functions

The following functions are added to a FluxNode by this mixin

* FNMGroupSecurity_AddGroup
* FNMGroupSecurity_UpdateGroup
* FNMGroupSecurity_DeleteGroup
* FNMGroupSecurity_FindGroups
* FNMGroupSecurity_AddUser
* FNMGroupSecurity_UpdateUser
* FNMGroupSecurity_DeleteUser
* FNMGroupSecurity_ValidateUser
* FNMGroupSecurity_FindUsers
* FNMGroupSecurity_AddUserToGroup
* FNMGroupSecurity_RemoveUserFromGroup
* FNMGroupSecurity_SetGroupPermission
* FNMGroupSecurity_SetUserPermission

## Emitted Events

The following events may be emitted by this mixin

* FNMGroupSecurity.GroupAdded
* FNMGroupSecurity.GroupUpdated
* FNMGroupSecurity.GroupDeleted
* FNMGroupSecurity.GroupListResult
* FNMGroupSecurity.UserAdded
* FNMGroupSecurity.UserUpdated
* FNMGroupSecurity.UserDeleted
* FNMGroupSecurity.UserLoggedIn
* FNMGroupSecurity.UserLoggedOut
* FNMGroupSecurity.UserAddedToGroup
* FNMGroupSecurity.UserRemovedFromGroup
* FNMGroupSecurity.GroupPermissionsUpdated
* FNMGroupSecurity.UserPermissionsUpdated

## Tracked Events

The following events are listened for by this mixin

* FNMGroupSecurity.AddGroup
* FNMGroupSecurity.UpdateGroup
* FNMGroupSecurity.DeleteGroup
* FNMGroupSecurity.FindGroups
* FNMGroupSecurity.AddUser
* FNMGroupSecurity.UpdatedUser
* FNMGroupSecurity.DeleteUser
* FNMGroupSecurity.FindUsers
* FNMGroupSecurity.AddUserToGroup
* FNMGroupSecurity.RemoveUserFromGroup
* FNMGroupSecurity.SetGroupPermission
* FNMGroupSecurity.SetUserPermission

## Defaults

The following defaults apply to this mixin

* FNMGroupSecurity_Settings.store: false (uses the FluxNode default store)
* FNMGroupSecurity_Settings.groupChannel: false (uses the FluxNode default channel)
* FNMGroupSecurity_Settings.store: false (uses the default FluxNode channel)
