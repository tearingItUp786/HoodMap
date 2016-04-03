<?php

/**
 * Yelp API v2.0 code sample.
 *
 * This program demonstrates the capability of the Yelp API version 2.0
 * by using the Search API to query for businesses by a search term and location,
 * and the Business API to query additional information about the top result
 * from the search query.
 *
 * Please refer to http://www.yelp.com/developers/documentation for the API documentation.
 *
 * This program requires a PHP OAuth2 library, which is included in this branch and can be
 * found here:
 *      http://oauth.googlecode.com/svn/code/php/
 *
 * Sample usage of the program:
 * `php sample.php --term="bars" --location="San Francisco, CA"`
 */

// Enter the path that the oauth library is in relation to the php file
require_once('lib/OAuth.php');

// Set your OAuth credentials here
// These credentials can be obtained from the 'Manage API Access' page in the
// developers documentation (http://www.yelp.com/developers)
$CONSUMER_KEY    = '';
$CONSUMER_SECRET = '';
$TOKEN           = '';
$TOKEN_SECRET    = '';

$API_HOST         = 'api.yelp.com';
$DEFAULT_TERM     = "indian";
$DEFAULT_LOCATION = 'Vancouver, Canada';

$DEALS         = true;
$RADIUS        = 3000;
$SEARCH_LIMIT  = 15;
$SEARCH_PATH   = '/v2/search/';
$BUSINESS_PATH = '/v2/business/';



/**
 * Makes a request to the Yelp API and returns the response
 *
 * @param    $host    The domain host of the API
 * @param    $path    The path of the APi after the domain
 * @return   The JSON response from the request
 */
function request($host, $path)
{
    $unsigned_url = "https://" . $host . $path;

    // Token object built using the OAuth library
    $token = new OAuthToken($GLOBALS['TOKEN'], $GLOBALS['TOKEN_SECRET']);

    // Consumer object built using the OAuth library
    $consumer = new OAuthConsumer($GLOBALS['CONSUMER_KEY'], $GLOBALS['CONSUMER_SECRET']);

    // Yelp uses HMAC SHA1 encoding
    $signature_method = new OAuthSignatureMethod_HMAC_SHA1();

    $oauthrequest = OAuthRequest::from_consumer_and_token($consumer, $token, 'GET', $unsigned_url);

    // Sign the request
    $oauthrequest->sign_request($signature_method, $consumer, $token);

    // Get the signed URL
    $signed_url = $oauthrequest->to_url();

    // Send Yelp API Call
    try {
        $ch = curl_init($signed_url);
        if (FALSE === $ch)
            throw new Exception('Failed to initialize');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        $data = curl_exec($ch);

        if (FALSE === $data)
            throw new Exception(curl_error($ch), curl_errno($ch));
        $http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        if (200 != $http_status)
            throw new Exception($data, $http_status);

        curl_close($ch);
    }
    catch (Exception $e) {
        trigger_error(sprintf('Curl failed with error #%d: %s', $e->getCode(), $e->getMessage()), E_USER_ERROR);
    }

    return $data;
}

/**
 * Query the Search API by a search term and location
 *
 * @param    $term        The search term passed to the API
 * @param    $location    The search location passed to the API
 * @return   The JSON response from the request
 */
function search($term, $location)
{
    $url_params = array();

    $url_params['term']     = $term ?: $GLOBALS['DEFAULT_TERM'];
    $url_params['location'] = $location ?: $GLOBALS['DEFAULT_LOCATION'];
    $url_params['limit']    = $GLOBALS['SEARCH_LIMIT'];
    // $url_params['deals_filter'] = $GLOBALS['DEALS'];
    // $url_params['radius_filter'] = $GLOBALS['RADIUS'];
    $search_path            = $GLOBALS['SEARCH_PATH'] . "?" . http_build_query($url_params);
    //echo $search_path."\n";
    return request($GLOBALS['API_HOST'], $search_path);
}

/**
 * Query the Business API by business_id
 *
 * @param    $business_id    The ID of the business to query
 * @return   The JSON response from the request
 */
function get_business($business_id)
{
    $business_path = $GLOBALS['BUSINESS_PATH'] . $business_id;

    return request($GLOBALS['API_HOST'], $business_path);
}

/**
 * Queries the API by the input values from the user
 *
 * @param    $term        The search term to query
 * @param    $location    The location of the business to query
 */
function query_api($term, $location)
{
    $response = search($term, $location);
    // echo $response;
    return $response;
    // original data
    // $response = json_decode(search($term, $location));
    // $business_id = $response->businesses[0]->id;

    //  print sprintf(
    //      "%d businesses found, querying business info for the top result \"%s\"\n\n",
    //      count($response->businesses),
    //      $business_id
    //  );

    // This will make the response only one business, which is not what I want
    // $response = get_business($business_id);
    //
    //  print sprintf("Result for business \"%s\" found:\n", $business_id);
    //  print "$response\n";

}

/**
 * User input is handled here
 */
$longopts = array(
    "term::",
    "location::"
);

$options  = getopt("", $longopts);
$term     = $options['term'] ?: $_POST['term'] ?: '';
$location = $options['location'] ?: $_POST['location'] ?: '';

$myFile = "onLoadData.txt";

if (!file_exists($myFile)) {
    $fh   = fopen($myFile, 'w');
    $data = query_api($term, $location);
    fwrite($fh, $data);
    fclose($fh);
}

$compareDate = strtotime('1 week ago');
$modDate     = filemtime($myFile);

if ($modDate <= $compareDate) {
    $fh   = fopen($myFile, 'w');
    $data = query_api($term, $location);
    fwrite($fh, $data);
    fclose($fh);
    echo $data;
} else {
    echo file_get_contents($myFile);
}
?>
