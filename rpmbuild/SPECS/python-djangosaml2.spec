%define component djangosaml2
%define platform python

Name:           %{platform}-%{component}
Version:        0.10.0
Release:        1%{?dist}
Summary:        pysaml2 integration in Django

Group:          Development/Libraries
License:        Apache 2.0
URL:            http://pypi.python.org/pypi/%{component}
Source0:        http://pypi.python.org/packages/source/d/%{component}/%{component}-%{version}.tar.gz

BuildArch:      noarch
BuildRequires:  python-devel python-setuptools
Requires:       Django
Requires:       python-pysaml2 = 0.4.3, python-memcached = 1.48
Requires:       xmlsec1 xmlsec1-openssl


%description
djangosaml2 is a Django application that integrates the PySAML2 library into
your project. This mean that you can protect your Django based project with a
service provider based on PySAML. This way it will talk SAML2 with your
Identity Provider allowing you to use this authentication mechanism. This
document will guide you through a few simple steps to accomplish such goal.

%prep
%setup -q -n %{component}-%{version}

rm -rf tests

%build
%{__python} setup.py build


%install
%{__python} setup.py install -O1 --skip-build --root %{buildroot}

%files
%doc README CHANGES COPYING

%{python_sitelib}/%{component}
%{python_sitelib}/%{component}-%{version}-*.egg-info/

%changelog
* Thu Jul 3 2013 Oscar Carballal Prego <ocarballal@yaco.es> - 0.10.0-1
- Updated spec for version 0.10
- python-djangosaml2 has been renamed to djangosaml2. Made changes to keep
  python-djangosaml2 in the system

* Tue Feb 5 2013 Antonio Perez-Aranda Alcaide <aperezaranda@yaco.es> - 0.9.0-1
- Initial RPM release
