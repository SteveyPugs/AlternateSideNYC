var page = window.location.href;
if (page.indexOf("localhost") == -1)
{
	if(!(/Mobile/i.test(navigator.userAgent))) {
		window.location.href = "home.html";
	}
}