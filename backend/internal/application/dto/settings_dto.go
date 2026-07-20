package dto

import "encoding/json"

type UpdateSettingRequest struct {
	Value json.RawMessage `json:"value"`
}

type SettingsResponse map[string]json.RawMessage
