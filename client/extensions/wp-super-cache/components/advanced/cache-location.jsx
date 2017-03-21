/**
 * External dependencies
 */
import React from 'react';
import { flowRight, pick } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import FormFieldset from 'components/forms/form-fieldset';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import SectionHeader from 'components/section-header';
import WrapSettingsForm from '../wrap-settings-form';

const CacheLocation = ( { fields, handleChange, translate } ) => {
	return (
		<div>
			<SectionHeader label={ translate( 'Cache Location' ) }>
				<Button
					compact={ true }
					primary={ true }
					type="submit">
						{ translate( 'Save Settings' ) }
				</Button>
			</SectionHeader>
			<Card>
				<form>
					<FormFieldset>
						<FormTextInput
							onChange={ handleChange( 'wp_cache_location' ) }
							value={ fields.wp_cache_location || '' } />
						<FormSettingExplanation>
							{ translate(
								'Change the location of your cache files. The default is WP_CONTENT_DIR . ' +
								'/cache/ which translates to {{cacheLocation/}}',
								{
									components: {
										cacheLocation: <span>{ fields.wp_cache_location }</span>,
									}
								}
							) }
						</FormSettingExplanation>
					</FormFieldset>
				</form>
			</Card>
		</div>
	);
};

const getFormSettings = settings => {
	return pick( settings, [
		'wp_cache_location',
	] );
};

export default flowRight(
	WrapSettingsForm( getFormSettings )
)( CacheLocation );
