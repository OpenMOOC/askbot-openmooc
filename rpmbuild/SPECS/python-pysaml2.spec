%define mod_name pysaml2

Name:           python-%{mod_name}
Version:        0.4.3
Release:        1%{?dist}
Summary:        Python implementation of SAML Version 2 to for instance be used in a WSGI environment

Group:          Development/Libraries
License:        Apache 2.0
URL:            http://pypi.python.org/pypi/%{mod_name}
Source0:        https://github.com/rohe/%{mod_name}/archive/%{version}.tar.gz

BuildArch:      noarch
BuildRequires:  python-devel python-setuptools
Requires:       python-decorator, python-httplib2, python-paste, python-zope-interface 
Requires:       python-repoze-who

%description
PySAML2 is a pure python implementation of a SAML2 service provider and to some
extend also the identity provider. Originally written to work in a WSGI
environment there are extensions that allow you to use it with other
frameworks.

%prep
%setup -q -n %{mod_name}-%{version}


%build
%{__python} setup.py build


%install
%{__python} setup.py install -O1 --skip-build --root %{buildroot}

 
%files
%doc doc/ INSTALL README TODO example

%{python_sitelib}/%{mod_name}-%{version}-*.egg-info/
%{python_sitelib}/s2repoze
%{python_sitelib}/saml2
%{python_sitelib}/xmldsig
%{python_sitelib}/xmlenc

%{_bindir}/make_metadata.py
%{_bindir}/parse_xsd2.py


%changelog
* Thu Jul 3 2013 Oscar Carballal Prego <ocarballal@yaco.es> - 0.4.3-1
- Updated spec to 0.4.3, got sources from github

* Tue Feb 5 2013 Antonio Perez-Aranda Alcaide <aperezaranda@yaco.es> - 0.4.2-1
- Initial RPM release
