/**
 * External dependencies
 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { flowRight, isEqual, keys, omit, pick, isNaN } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { protectForm } from 'lib/protect-form';
import trackForm from 'lib/track-form';
import {
	isRequestingSiteSettings,
	isSavingSiteSettings,
	isSiteSettingsSaveSuccessful,
	getSiteSettingsSaveError,
	getSiteSettings
} from 'state/site-settings/selectors';
import {
	isRequestingJetpackSettings,
	isUpdatingJetpackSettings,
	isJetpackSettingsSaveFailure,
	getJetpackSettings
} from 'state/selectors';
import { recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import { saveSiteSettings } from 'state/site-settings/actions';
import { updateSettings } from 'state/jetpack/settings/actions';
import { removeNotice, successNotice, errorNotice } from 'state/notices/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite, siteSupportsJetpackSettingsUi } from 'state/sites/selectors';
import QuerySiteSettings from 'components/data/query-site-settings';
import QueryJetpackSettings from 'components/data/query-jetpack-settings';

const wrapSettingsForm = getFormSettings => SettingsForm => {
	class WrappedSettingsForm extends Component {
		state = {
			uniqueEvents: {}
		};

		componentWillMount() {
			this.props.replaceFields( getFormSettings( this.props.settings ) );
		}

		componentDidUpdate( prevProps ) {
			if ( prevProps.siteId !== this.props.siteId ) {
				this.props.clearDirtyFields();
				const newSiteFields = getFormSettings( this.props.settings );
				this.props.replaceFields( newSiteFields );
			} else if (
				! isEqual( prevProps.settings, this.props.settings ) ||
				! isEqual( prevProps.fields, this.props.fields )
			) {
				this.updateDirtyFields();
			}

			if (
				! this.props.isSavingSettings &&
				prevProps.isSavingSettings
			) {
				if ( this.props.isSaveRequestSuccessful ) {
					this.props.successNotice( this.props.translate( 'Settings saved!' ), { id: 'site-settings-save' } );
				} else {
					let text = this.props.translate( 'There was a problem saving your changes. Please try again.' );
					switch ( this.props.siteSettingsSaveError ) {
						case 'invalid_ip':
							text = this.props.translate( 'One of your IP Addresses was invalid. Please try again.' );
							break;
					}
					this.props.errorNotice( text, { id: 'site-settings-save' } );
				}
			}
		}

		updateDirtyFields() {
			const currentFields = this.props.fields;
			const persistedFields = getFormSettings( this.props.settings );

			// Compute the dirty fields by comparing the persisted and the current fields
			const previousDirtyFields = this.props.dirtyFields;
			/*eslint-disable eqeqeq*/
			const nextDirtyFields = previousDirtyFields.filter( field => ! ( currentFields[ field ] == persistedFields[ field ] ) );
			/*eslint-enable eqeqeq*/

			// Update the dirty fields state without updating their values
			if ( nextDirtyFields.length === 0 ) {
				this.props.markSaved();
			} else {
				this.props.markChanged();
			}
			this.props.clearDirtyFields();
			this.props.updateFields( pick( currentFields, nextDirtyFields ) );

			// Set the new non dirty fields
			const nextNonDirtyFields = omit( persistedFields, nextDirtyFields );
			this.props.replaceFields( nextNonDirtyFields );
		}

		// Some Utils
		handleSubmitForm = event => {
			if ( ! event.isDefaultPrevented() && event.nativeEvent ) {
				event.preventDefault();
			}

			this.submitForm();
			this.props.trackEvent( 'Clicked Save Settings Button' );
		};

		submitForm = () => {
			const { fields, settingsFields, siteId, jetpackSettingsUISupported } = this.props;
			this.props.removeNotice( 'site-settings-save' );

			this.props.saveSiteSettings( siteId, pick( fields, settingsFields.site ) );
			if ( jetpackSettingsUISupported ) {
				this.props.updateSettings( siteId, pick( fields, settingsFields.jetpack ) );
			}
		};

		handleRadio = event => {
			const currentTargetName = event.currentTarget.name,
				currentTargetValue = event.currentTarget.value;

			this.props.updateFields( { [ currentTargetName ]: currentTargetValue } );
		};

		handleSelect = event => {
			const { name, value } = event.currentTarget;
			// Attempt to cast numeric fields value to int
			const parsedValue = parseInt( value, 10 );
			this.props.updateFields( { [ name ]: isNaN( parsedValue ) ? value : parsedValue } );
		};

		handleToggle = name => () => {
			this.props.trackEvent( `Toggled ${ name }` );
			this.props.updateFields( { [ name ]: ! this.props.fields[ name ] } );
		};

		handleAutosavingToggle = name => () => {
			this.props.trackEvent( `Toggled ${ name }` );
			this.props.updateFields( { [ name ]: ! this.props.fields[ name ] }, () => {
				this.submitForm();
			} );
		};

		onChangeField = field => event => {
			this.props.updateFields( {
				[ field ]: event.target.value
			} );
		};

		setFieldValue = ( field, value ) => {
			this.props.updateFields( {
				[ field ]: value
			} );
		};

		uniqueEventTracker = message => () => {
			if ( this.state.uniqueEvents[ message ] ) {
				return;
			}
			const uniqueEvents = {
				...this.state.uniqueEvents,
				[ message ]: true,
			};
			this.setState( { uniqueEvents } );
			this.props.trackEvent( message );
		};

		render() {
			const utils = {
				handleRadio: this.handleRadio,
				handleSelect: this.handleSelect,
				handleSubmitForm: this.handleSubmitForm,
				handleToggle: this.handleToggle,
				handleAutosavingToggle: this.handleAutosavingToggle,
				onChangeField: this.onChangeField,
				setFieldValue: this.setFieldValue,
				submitForm: this.submitForm,
				uniqueEventTracker: this.uniqueEventTracker,
			};

			return (
				<div>
					<QuerySiteSettings siteId={ this.props.siteId } />
					{
						this.props.jetpackSettingsUISupported &&
						<QueryJetpackSettings siteId={ this.props.siteId } />
					}
					<SettingsForm { ...this.props } { ...utils } />
				</div>
			);
		}
	}

	const connectComponent = connect(
		state => {
			const siteId = getSelectedSiteId( state );
			let isSavingSettings = isSavingSiteSettings( state, siteId );
			let isSaveRequestSuccessful = isSiteSettingsSaveSuccessful( state, siteId );
			let settings = getSiteSettings( state, siteId );
			let isRequestingSettings = isRequestingSiteSettings( state, siteId ) && ! settings;
			const siteSettingsSaveError = getSiteSettingsSaveError( state, siteId );
			const settingsFields = {
				site: keys( settings ),
			};

			const isJetpack = isJetpackSite( state, siteId );
			const jetpackSettingsUISupported = isJetpack && siteSupportsJetpackSettingsUi( state, siteId );
			if ( jetpackSettingsUISupported ) {
				const jetpackSettings = getJetpackSettings( state, siteId );
				isSavingSettings = isSavingSettings || isUpdatingJetpackSettings( state, siteId );
				isSaveRequestSuccessful = isSaveRequestSuccessful && ! isJetpackSettingsSaveFailure( state, siteId );
				settings = { ...settings, ...jetpackSettings };
				settingsFields.jetpack = keys( jetpackSettings );
				isRequestingSettings = isRequestingSettings || ( isRequestingJetpackSettings( state, siteId ) && ! jetpackSettings );
			}

			return {
				isRequestingSettings,
				isSavingSettings,
				isSaveRequestSuccessful,
				siteSettingsSaveError,
				settings,
				settingsFields,
				siteId,
				jetpackSettingsUISupported
			};
		},
		dispatch => {
			const boundActionCreators = bindActionCreators( {
				errorNotice,
				recordTracksEvent,
				removeNotice,
				saveSiteSettings,
				successNotice,
				updateSettings,
			}, dispatch );
			const trackEvent = name => dispatch( recordGoogleEvent( 'Site Settings', name ) );
			return {
				...boundActionCreators,
				eventTracker: message => () => trackEvent( message ),
				trackEvent,
			};
		}
	);

	return flowRight(
		connectComponent,
		localize,
		trackForm,
		protectForm
	)( WrappedSettingsForm );
};

export default wrapSettingsForm;
