%global mod_name lamson

Name:           python-lamson
Version:        1.1
Release:        4%{?dist}
Summary:        A modern Pythonic mail server

Group:          Development/Libraries
License:        GPLv3
URL:            http://pypi.python.org/pypi/%{mod_name}
Source0:        http://pypi.python.org/packages/source/l/%{mod_name}/%{mod_name}-%{version}.tar.gz
Patch0:         setup.patch

BuildArch:      noarch
BuildRequires:  python-devel
BuildRequires:  python-setuptools
BuildRequires:  python-chardet
BuildRequires:  python-jinja2
BuildRequires:  python-nose
BuildRequires:  python-daemon
BuildRequires:  python-lockfile

%description
Lamson is a pure Python SMTP server designed to create robust and complex mail
applications in the style of modern web frameworks such as Django. Unlike
traditional SMTP servers like Postfix or Sendmail, Lamson has all the features
of a web application stack (ORM, templates, routing, handlers, state machines,
Python) without needing to configure alias files, run new aliases, or juggle 
tons of tiny fragile processes. Lamson also plays well with other web 
frameworks and Python libraries.


%prep
%setup -q -n %{mod_name}-%{version}
%patch0 -p0

rm -f doc/lamsonproject.org/output/favicon.ico
sed -i "s|\r||g" doc/lamsonproject.org/Session.vim
sed -i "s|\r||g" README

%build
CFLAGS="$RPM_OPT_FLAGS" %{__python} setup.py build


%install
rm -rf $RPM_BUILD_ROOT
%{__python} setup.py install -O1 --skip-build --root $RPM_BUILD_ROOT

 
%files
%doc doc/ LICENSE PKG-INFO README
%{_bindir}/%{mod_name}
%{python_sitelib}/*.egg-info/
%{python_sitelib}/%{mod_name}

%changelog
* Sat Jul 21 2012 Fedora Release Engineering <rel-eng@lists.fedoraproject.org> - 1.1-4
- Rebuilt for https://fedoraproject.org/wiki/Fedora_18_Mass_Rebuild

* Sat Jan 14 2012 Fedora Release Engineering <rel-eng@lists.fedoraproject.org> - 1.1-3
- Rebuilt for https://fedoraproject.org/wiki/Fedora_17_Mass_Rebuild

* Fri Jul 22 2011 Praveen Kumar <kumarpraveen.nitdgp@gmail.com> - 1.1-2
- Remove python-mock dependency

* Fri Jul 22 2011 Praveen Kumar <kumarpraveen.nitdgp@gmail.com> - 1.1-1
- Initial RPM release
