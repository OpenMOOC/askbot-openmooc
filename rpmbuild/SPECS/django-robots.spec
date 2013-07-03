Name:           django-robots
Version:        0.8.1
Release:        1%{?dist}
Summary:        Robots exclusion application for Django, complementing Sitemaps

Group:          Development/Languages
License:        BSD
URL:            http://pypi.python.org/pypi/%{name}
Source0:        http://pypi.python.org/packages/source/d/%{name}/%{name}-%{version}.tar.gz

BuildArch:      noarch
BuildRequires:  python-setuptools-devel python-devel gettext
Requires:       Django

%description
Django application to manage robots.txt files following the robots exclusion 
protocol, complementing the Django Sitemap contrib app.

%prep
%setup -q
# remove AppleDouble encoded Macintosh file. Informed upstream
rm docs/._overview.txt
%build
%{__python} setup.py build

%install
rm -rf $RPM_BUILD_ROOT
%{__python} setup.py install -O1 --skip-build --root $RPM_BUILD_ROOT

# Language files; not under /usr/share, need to be handled manually
(cd $RPM_BUILD_ROOT && find . -name 'django.?o') | sed -e 's|^.||' | sed -e \
  's:\(.*/locale/\)\([^/_]\+\)\(.*\.mo$\):%lang(\2) \1\2\3:' \
  >> %{name}.lang

%files -f %{name}.lang
%defattr(-,root,root,-)
%doc LICENSE.txt README.rst docs/ 
# list some files explicitly to avoid listing locale files twice
%{python_sitelib}/robots/*.py*
%{python_sitelib}/robots/templates/robots/rule_list.html
%{python_sitelib}/django_robots*.egg-info

%changelog
* Thu Jul 03 2013 Oscar Carballal <ocarballal@yaco.es> - 0.8.1-1
- Created spec for 0.8.1 from https://arm.koji.fedoraproject.org/koji/buildinfo?buildID=119620

* Thu Apr 14 2011 Rahul Sundaram <sundaram@fedoraproject.org> - 0.8.0-1
- initial spec
