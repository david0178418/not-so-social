import { Settings } from '@common/types';
import { getCollection } from '../mongodb';
import {
	DbCollections,
	SettingTypes,
} from '@common/constants';

let CachedSettings: Settings | null = null;

export
async function fetchSettings() {
	if(!CachedSettings) {
		const col = await getCollection(DbCollections.AppMetadata);

		const result = await col.findOne({ type: SettingTypes.AwardSettings });

		CachedSettings = result?.data;
	}

	return CachedSettings as Settings;
}
