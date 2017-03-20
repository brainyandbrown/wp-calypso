/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import debugFactory from 'debug';
import { getCurrentUser } from 'state/current-user/selectors';

const debug = debugFactory( 'calypso:redirect-when-logged-in' );

class RedirectWhenLoggedIn extends React.Component {
	doTheRedirect() {
		debug( this.props.replaceCurrentLocation ? 'replace' : 'assign', this.props.redirectTo );
		this.props.replaceCurrentLocation
			? window.location.replace( this.props.redirectTo )
			: window.location.assign( this.props.redirectTo );
	}

	isUserLoggedIn( user ) {
		const { waitForEmailAddress, waitForUserId } = this.props;

		if ( ! ( user && user.email && user.ID ) ) {
			return false;
		}

		if ( waitForEmailAddress && waitForEmailAddress !== user.email ) {
			return false;
		}

		if ( waitForUserId && waitForUserId !== user.ID ) {
			return false;
		}

		return true;
	}

	storageEventHandler( e ) {
		if ( e.key !== 'wpcom_user' ) {
			return;
		}
		try {
			const newUser = JSON.parse( e.newValue );
			if ( this.isUserLoggedIn( newUser ) ) {
				this.doTheRedirect();
			}
		} catch ( ex ) {}
	}

	componentWillMount() {
		if ( this.isUserLoggedIn( this.props.currentUser ) ) {
			this.doTheRedirect();
		}
		debug( 'adding storage event listener' );
		window.addEventListener( 'storage', this.storageEventHandler.bind( this ) );
	}

	componentWillUnmount() {
		debug( 'removing storage event listener' );
		window.removeEventListener( 'storage', this.storageEventHandler.bind( this ) );
	}

	render() {
		return null;
	}
}

RedirectWhenLoggedIn.propTypes = {
	redirectTo: React.PropTypes.string.isRequired,
	replaceCurrentLocation: React.PropTypes.bool,
	waitForEmailAddress: React.PropTypes.string,
	waitForUserId: React.PropTypes.number,
};

const mapState = state => {
	return {
		currentUser: getCurrentUser( state ),
	};
};

export default connect( mapState )( RedirectWhenLoggedIn );
