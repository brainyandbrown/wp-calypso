/**
 * External dependencies
 */
import React, { Component } from 'react';
import omit from 'lodash/omit';

/**
 * Internal dependencies
 */
import Debug from 'debug';
const debug = Debug( 'calypso:site-observe-hoc' );

export const sitesObserver = ( WrappedComponent ) => {
	class SitesObserverComponent extends Component {

		constructor( props, context ) {
			super( props, context );

			this.state = {};
		}

		componentDidMount() {
			this.props.sites.on( 'change', this.update );
			this.cacheSites();
		}

		componentWillUnmount() {
			this.props.sites.off( 'change', this.update );
		}

		update() {
			debug( 'Re-rendering ' + this.constructor.displayName + ' component.' );
			this.cacheSites();
		}

		cacheSites() {
			// Copy the array of sites list so we can pass the exact
			// same array to the wrapped component unless sites change.
			if ( this.props.sites ) {
				this.setState( { sites: this.props.sites.get().slice() } );
			}
		}

		render() {
			return (
				<WrappedComponent
					sites={ this.state.sites }
					{ ...omit( this.props, 'sites' ) }
				/>
			);
		}
	}

	SitesObserverComponent.displayName =
		WrappedComponent.displayName || WrappedComponent.name || 'Component';

	return SitesObserverComponent;
};

export default sitesObserver;
