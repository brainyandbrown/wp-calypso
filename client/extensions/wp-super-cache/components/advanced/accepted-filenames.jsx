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
import ExternalLink from 'components/external-link';
import FormFieldset from 'components/forms/form-fieldset';
import FormToggle from 'components/forms/form-toggle/compact';
import SectionHeader from 'components/section-header';
import WrapSettingsForm from '../wrap-settings-form';

const AcceptedFilenames = ( { fields, handleToggle, translate } ) => {
	return (
		<div>
			<SectionHeader label={ translate( 'Accepted Filenames & Rejected URIs' ) }>
				<Button
					compact={ true }
					primary={ true }
					type="submit">
						{ translate( 'Save Settings' ) }
				</Button>
			</SectionHeader>
			<Card>
				<p>
					{ translate(
						'Do not cache the following page types. See the {{a}}Conditional Tags{{/a}} documentation ' +
						'for a complete discussion on each type.',
						{
							components: {
								a: (
									<ExternalLink
										icon={ true }
										target="_blank"
										href="http://codex.wordpress.org/Conditional_Tags"
									/>
								),
							}
						}
					) }
				</p>
				<form>
					<FormFieldset>
						<FormToggle
							checked={ fields.single }
							onChange={ handleToggle( 'single' ) }>
							<span>
								{ translate( 'Single Posts (is_single)' ) }
							</span>
						</FormToggle>

						<FormToggle
							checked={ fields.pages }
							onChange={ handleToggle( 'pages' ) }>
							<span>
								{ translate( 'Pages (is_page)' ) }
							</span>
						</FormToggle>

						<FormToggle
							checked={ fields.frontpage }
							onChange={ handleToggle( 'frontpage' ) }>
							<span>
								{ translate( 'Front Page (is_front_page)' ) }
							</span>
						</FormToggle>

						<FormToggle
							checked={ fields.home }
							onChange={ handleToggle( 'home' ) }>
							<span>
								{ translate( 'Home (is_home)' ) }
							</span>
						</FormToggle>

						<FormToggle
							checked={ fields.archives }
							onChange={ handleToggle( 'archives' ) }>
							<span>
								{ translate( 'Archives (is_archive)' ) }
							</span>
						</FormToggle>

						<FormToggle
							checked={ fields.tag }
							onChange={ handleToggle( 'tag' ) }>
							<span>
								{ translate( 'Tags (is_tag)' ) }
							</span>
						</FormToggle>

						<FormToggle
							checked={ fields.category }
							onChange={ handleToggle( 'category' ) }>
							<span>
								{ translate( 'Category (is_category)' ) }
							</span>
						</FormToggle>

						<FormToggle
							checked={ fields.feed }
							onChange={ handleToggle( 'feed' ) }>
							<span>
								{ translate( 'Feeds (is_feed)' ) }
							</span>
						</FormToggle>

						<FormToggle
							checked={ fields.search }
							onChange={ handleToggle( 'search' ) }>
							<span>
								{ translate( 'Search Pages (is_search)' ) }
							</span>
						</FormToggle>

						<FormToggle
							checked={ fields.author }
							onChange={ handleToggle( 'author' ) }>
							<span>
								{ translate( 'Author Pages (is_author)' ) }
							</span>
						</FormToggle>
					</FormFieldset>
				</form>
			</Card>
		</div>
	);
};

const getFormSettings = settings => {
	return pick( settings.wp_cache_pages, [
		'search',
		'feed',
		'category',
		'home',
		'frontpage',
		'tag',
		'archives',
		'pages',
		'single',
		'author',
	] );
};

export default flowRight(
	WrapSettingsForm( getFormSettings )
)( AcceptedFilenames );
