%define mod_name djangosaml2

Name:           python-%{mod_name}
Version:        0.9.0
Release:        1%{?dist}
Summary:        pysaml2 integration in Django

Group:          Development/Libraries
License:        Apache 2.0
URL:            http://pypi.python.org/pypi/%{mod_name}
Source0:        http://pypi.python.org/packages/source/d/%{mod_name}/%{mod_name}-%{version}.tar.gz

BuildArch:      noarch
BuildRequires:  python-devel
BuildRequires:  python-setuptools
Requires:       python-pysaml2 python-memcached
Requires:       xmlsec1 xmlsec1-openssl


%description
djangosaml2 is a Django application that integrates the PySAML2 library into
your project. This mean that you can protect your Django based project with a
service provider based on PySAML. This way it will talk SAML2 with your
Identity Provider allowing you to use this authentication mechanism. This
document will guide you through a few simple steps to accomplish such goal.

%prep
%setup -q -n %{mod_name}-%{version}

rm -rf tests

%build
%{__python} setup.py build


%install
%{__python} setup.py install -O1 --skip-build --root %{buildroot}

%files
%doc README CHANGES COPYING

%{python_sitelib}/%{mod_name}
%{python_sitelib}/%{mod_name}-%{version}-*.egg-info/

%changelog
* Tue Feb 5 2013 Antonio Perez-Aranda Alcaide <aperezaranda@yaco.es> - 0.9.0-1
- Initial RPM release
